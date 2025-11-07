"use client";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  type PromptInputMessage,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Action, Actions } from "@/components/ai-elements/actions";
import { Fragment, useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Response } from "@/components/ai-elements/response";
import { CopyIcon, GlobeIcon, RefreshCcwIcon } from "lucide-react";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { Loader } from "@/components/ai-elements/loader";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { useCanvasStore } from "@/hooks/useCanvasStore";
import type { VisualizationConfig } from "@/types/visualization";
import { VisualizationCanvas } from "@/components/canvas/VisualizationCanvas";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDownIcon } from "lucide-react";

const models = [
  {
    name: "GPT-4.1",
    value: "gpt-4.1",
  },
];

const isVisualizationConfig = (
  value: unknown
): value is VisualizationConfig => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as VisualizationConfig;
  return (
    typeof candidate.type === "string" &&
    typeof candidate.title === "string" &&
    Array.isArray(candidate.data)
  );
};

const ChatBotDemo = () => {
  const [input, setInput] = useState("");
  const [model, setModel] = useState<string>("gpt-4.1");
  const [webSearch, setWebSearch] = useState(false);
  const { messages, sendMessage, status, regenerate } = useChat();
  const addVisualization = useCanvasStore((state) => state.addVisualization);
  const processedToolResults = useRef(new Set<string>());
  const visualizationCount = useCanvasStore((state) => state.visualizations.size);
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);

  // Determine current phase based on tool calls
  const getCurrentPhase = (messageParts: any[]): "planning" | "building" | "execution" | "reporting" | null => {
    for (const part of messageParts) {
      if (part.type?.startsWith("tool-")) {
        const toolName = part.type.replace("tool-", "");
        if (toolName === "FinalizePlan") return "building";
        if (toolName === "FinalizeBuild") return "execution";
        if (toolName === "ExecuteSQLWithRepair" || toolName === "ExecuteSQL") return "reporting";
        if (["ReadEntityYamlRaw", "LoadEntitiesBulk", "ScanEntityProperties", "AssessEntityCoverage", "SearchCatalog", "SearchSchema", "ClarifyIntent", "FinalizeNoData"].includes(toolName)) return "planning";
        if (["BuildSQL", "ValidateSQL"].includes(toolName)) return "building";
        if (["EstimateCost"].includes(toolName)) return "execution";
        if (["SanityCheck", "FormatResults", "ExplainResults", "FinalizeReport", "generateBarChart", "generateLineChart", "generatePieChart", "generateScatterPlot", "autoSelectVisualization"].includes(toolName)) return "reporting";
      }
    }
    return null;
  };

  const getPhaseLabel = (phase: string | null): string => {
    switch (phase) {
      case "planning": return "Planning";
      case "building": return "Building SQL";
      case "execution": return "Executing Query";
      case "reporting": return "Generating Report";
      default: return "Processing";
    }
  };

  useEffect(() => {
    messages.forEach((message) => {
      if (message.role !== "assistant") {
        return;
      }

      message.parts.forEach((part, index) => {
        const key = `${message.id}-${index}`;

        if (
          processedToolResults.current.has(key) ||
          !part.type?.startsWith("tool-") ||
          !("output" in part) ||
          !part.output ||
          typeof part.output !== "object"
        ) {
          return;
        }

        const payload = part.output as Record<string, unknown>;
        const visualizations: VisualizationConfig[] = [];

        if (
          "visualization" in payload &&
          isVisualizationConfig(payload.visualization)
        ) {
          visualizations.push(payload.visualization);
        }

        if (
          "visualizations" in payload &&
          Array.isArray(payload.visualizations)
        ) {
          payload.visualizations.forEach((viz) => {
            if (isVisualizationConfig(viz)) {
              visualizations.push(viz);
            }
          });
        }

        if (visualizations.length === 0) {
          return;
        }

        visualizations.forEach((viz) => {
          const { id: _id, ...rest } = viz;
          addVisualization(rest);
        });

        processedToolResults.current.add(key);
      });
    });
  }, [messages, addVisualization]);

  // Auto-open canvas when visualizations are added
  useEffect(() => {
    if (visualizationCount > 0 && !isCanvasOpen) {
      setIsCanvasOpen(true);
    }
  }, [visualizationCount, isCanvasOpen]);

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    sendMessage(
      {
        text: message.text || "Sent with attachments",
        files: message.files,
      },
      {
        body: {
          model: model,
          webSearch: webSearch,
        },
      }
    );
    setInput("");
  };

  return (
    <div className="relative mx-auto flex h-full w-full max-w-4xl flex-col p-6">
      <div className="flex h-full flex-col">
        <Conversation className="flex-1">
          <ConversationContent>
            {messages.map((message) => {
              const currentPhase = message.role === "assistant" ? getCurrentPhase(message.parts) : null;
              const isStreaming = status === "streaming" && message.id === messages.at(-1)?.id;
              const hasReasoning = message.parts.some((part) => part.type === "reasoning");
              const toolParts = message.parts.filter((part) => part.type?.startsWith("tool-"));
              const hasMultipleTools = toolParts.length > 1;

              return (
                <div key={message.id}>
                  {message.role === "assistant" &&
                    message.parts.filter((part) => part.type === "source-url")
                      .length > 0 && (
                      <Sources>
                        <SourcesTrigger
                          count={
                            message.parts.filter(
                              (part) => part.type === "source-url"
                            ).length
                          }
                        />
                        {message.parts
                          .filter((part) => part.type === "source-url")
                          .map((part, i) => (
                            <SourcesContent key={`${message.id}-${i}`}>
                              <Source
                                key={`${message.id}-${i}`}
                                href={part.url}
                                title={part.url}
                              />
                            </SourcesContent>
                          ))}
                      </Sources>
                    )}

                  {/* Show Chain of Thought for multi-step reasoning */}
                  {message.role === "assistant" && hasMultipleTools && (
                    <ChainOfThought className="mb-4" defaultOpen={isStreaming}>
                      <ChainOfThoughtHeader>
                        {isStreaming ? (
                          <Shimmer>{getPhaseLabel(currentPhase)}</Shimmer>
                        ) : (
                          getPhaseLabel(currentPhase) || "Processing"
                        )}
                      </ChainOfThoughtHeader>
                      <ChainOfThoughtContent>
                        {toolParts.map((part, idx) => {
                          if (!part.type?.startsWith("tool-")) return null;
                          const toolName = part.type.replace("tool-", "");
                          const isLastTool = idx === toolParts.length - 1;
                          const toolStatus = isStreaming && isLastTool
                            ? "active"
                            : idx < toolParts.length - 1
                            ? "complete"
                            : "pending";

                          // Format tool name for display
                          const formatToolName = (name: string): string => {
                            return name
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())
                              .trim();
                          };

                          return (
                            <ChainOfThoughtStep
                              key={`${message.id}-tool-${idx}`}
                              label={formatToolName(toolName)}
                              status={toolStatus}
                            />
                          );
                        })}
                      </ChainOfThoughtContent>
                    </ChainOfThought>
                  )}

                  {message.parts.map((part, i) => {
                    const isLastPart = i === message.parts.length - 1;
                    const isStreamingPart = isStreaming && isLastPart && message.id === messages.at(-1)?.id;

                    switch (part.type) {
                      case "text":
                        return (
                          <Fragment key={`${message.id}-${i}`}>
                            <Message from={message.role}>
                              <MessageContent>
                                {isStreamingPart && !part.text ? (
                                  <Shimmer>Generating response...</Shimmer>
                                ) : (
                                  <Response>{part.text}</Response>
                                )}
                              </MessageContent>
                            </Message>
                            {message.role === "assistant" &&
                              isLastPart &&
                              part.text && (
                                <Actions className="mt-2">
                                  <Action
                                    onClick={() => regenerate()}
                                    label="Retry"
                                  >
                                    <RefreshCcwIcon className="size-3" />
                                  </Action>
                                  <Action
                                    onClick={() =>
                                      navigator.clipboard.writeText(part.text)
                                    }
                                    label="Copy"
                                  >
                                    <CopyIcon className="size-3" />
                                  </Action>
                                </Actions>
                              )}
                          </Fragment>
                        );
                      case "reasoning":
                        return (
                          <Reasoning
                            key={`${message.id}-${i}`}
                            className="w-full"
                            isStreaming={isStreamingPart}
                          >
                            <ReasoningTrigger />
                            <ReasoningContent>
                              {part.text || ""}
                            </ReasoningContent>
                          </Reasoning>
                        );
                      default:
                        if (
                          part.type.startsWith("tool-") &&
                          "state" in part &&
                          "input" in part
                        ) {
                          const toolType = part.type as `tool-${string}`;
                          const toolName = toolType.replace("tool-", "");
                          const isToolStreaming = isStreamingPart && (part.state === "input-streaming" || part.state === "input-available");

                          return (
                            <Tool key={`${message.id}-${i}`}>
                              <ToolHeader type={toolType} state={part.state} />
                              <ToolContent>
                                <ToolInput input={part.input} />
                                <ToolOutput
                                  output={
                                    part.output ? (
                                      <Response>
                                        {typeof part.output === "string"
                                          ? part.output
                                          : JSON.stringify(part.output, null, 2)}
                                      </Response>
                                    ) : isToolStreaming ? (
                                      <Shimmer>{`Executing ${toolName}...`}</Shimmer>
                                    ) : null
                                  }
                                  errorText={part.errorText}
                                />
                              </ToolContent>
                            </Tool>
                          );
                        }
                        return null;
                    }
                  })}
                {/* Display narrative from FinalizeReport as final result with proper streaming */}
                {message.role === "assistant" &&
                  (() => {
                    // Check if there's already a text part - if so, don't duplicate
                    const hasTextPart = message.parts.some(
                      (part) => part.type === "text" && part.text
                    );
                    if (hasTextPart) {
                      return null;
                    }

                    // Find FinalizeReport by checking for the specific output structure
                    const finalizeReportPart = message.parts.find(
                      (part) =>
                        part.type?.startsWith("tool-") &&
                        "output" in part &&
                        part.output &&
                        typeof part.output === "object" &&
                        "narrative" in part.output &&
                        "sql" in part.output &&
                        "confidence" in part.output
                    );

                    if (finalizeReportPart && "output" in finalizeReportPart) {
                      const output = finalizeReportPart.output as {
                        narrative: string;
                      };
                      const isFinalizeReportStreaming = 
                        isStreaming && 
                        (finalizeReportPart.state === "input-streaming" || 
                         finalizeReportPart.state === "input-available") &&
                        !output.narrative;
                      const isLastMessage = message.id === messages.at(-1)?.id;

                      if (output.narrative || isFinalizeReportStreaming) {
                        return (
                          <Message from={message.role}>
                            <MessageContent>
                              {isFinalizeReportStreaming ? (
                                <Shimmer>Generating report...</Shimmer>
                              ) : output.narrative ? (
                                <Response>{output.narrative}</Response>
                              ) : (
                                <Shimmer>Processing...</Shimmer>
                              )}
                            </MessageContent>
                            {output.narrative && isLastMessage && !isStreaming && (
                              <Actions className="mt-2">
                                <Action
                                  onClick={() => regenerate()}
                                  label="Retry"
                                >
                                  <RefreshCcwIcon className="size-3" />
                                </Action>
                                <Action
                                  onClick={() =>
                                    navigator.clipboard.writeText(output.narrative)
                                  }
                                  label="Copy"
                                >
                                  <CopyIcon className="size-3" />
                                </Action>
                              </Actions>
                            )}
                          </Message>
                        );
                      }
                    }
                    return null;
                  })()}
                {/* Display message from FinalizeNoData as final result with proper streaming */}
                {message.role === "assistant" &&
                  (() => {
                    // Check if there's already a text part - if so, don't show FinalizeNoData message
                    const hasTextPart = message.parts.some(
                      (part) => part.type === "text" && part.text
                    );
                    if (hasTextPart) {
                      return null;
                    }

                    // Find FinalizeNoData by checking for the specific output structure
                    const finalizeNoDataPart = message.parts.find(
                      (part) =>
                        part.type?.startsWith("tool-") &&
                        "output" in part &&
                        part.output &&
                        typeof part.output === "object" &&
                        "message" in part.output &&
                        !("narrative" in part.output) &&
                        !("sql" in part.output)
                    );

                    if (finalizeNoDataPart && "output" in finalizeNoDataPart) {
                      const output = finalizeNoDataPart.output as {
                        message: string;
                      };
                      const isFinalizeNoDataStreaming = 
                        isStreaming && 
                        (finalizeNoDataPart.state === "input-streaming" || 
                         finalizeNoDataPart.state === "input-available") &&
                        !output.message;
                      const isLastMessage = message.id === messages.at(-1)?.id;

                      if (output.message || isFinalizeNoDataStreaming) {
                        return (
                          <Message from={message.role}>
                            <MessageContent>
                              {isFinalizeNoDataStreaming ? (
                                <Shimmer>Preparing response...</Shimmer>
                              ) : output.message ? (
                                <Response>{output.message}</Response>
                              ) : (
                                <Shimmer>Processing...</Shimmer>
                              )}
                            </MessageContent>
                            {output.message && isLastMessage && !isStreaming && (
                              <Actions className="mt-2">
                                <Action
                                  onClick={() => regenerate()}
                                  label="Retry"
                                >
                                  <RefreshCcwIcon className="size-3" />
                                </Action>
                                <Action
                                  onClick={() =>
                                    navigator.clipboard.writeText(output.message)
                                  }
                                  label="Copy"
                                >
                                  <CopyIcon className="size-3" />
                                </Action>
                              </Actions>
                            )}
                          </Message>
                        );
                      }
                    }
                    return null;
                  })()}
                </div>
              );
            })}
            {status === "submitted" && (
              <div className="flex items-center gap-2 py-4">
                <Loader />
                <Shimmer>Processing your request...</Shimmer>
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {/* Canvas for visualizations - appears when agent creates visualizations */}
        {visualizationCount > 0 && (
          <Collapsible open={isCanvasOpen} onOpenChange={setIsCanvasOpen} className="mt-4 border-t">
            <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">Visualizations</h3>
                <span className="text-xs text-muted-foreground">
                  {visualizationCount} {visualizationCount === 1 ? "chart" : "charts"}
                </span>
              </div>
              <ChevronDownIcon
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  isCanvasOpen ? "rotate-180" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="h-[400px] border-t">
                <VisualizationCanvas />
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        <PromptInput
          onSubmit={handleSubmit}
          className="mt-4"
          globalDrop
          multiple
        >
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputModelSelect
                onValueChange={(value) => {
                  setModel(value);
                }}
                value={model}
              >
                <PromptInputModelSelectTrigger>
                  <PromptInputModelSelectValue />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {models.map((model) => (
                    <PromptInputModelSelectItem
                      key={model.value}
                      value={model.value}
                    >
                      {model.name}
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            </PromptInputTools>
            <PromptInputSubmit disabled={!input && !status} status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
};

export default ChatBotDemo;
