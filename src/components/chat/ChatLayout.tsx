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

              // Check if FinalizeReport is complete to determine visibility
              const finalizeReportComplete = message.parts.some(
                (part) =>
                  part.type?.startsWith("tool-FinalizeReport") &&
                  "output" in part &&
                  part.output &&
                  typeof part.output === "object" &&
                  "narrative" in part.output &&
                  typeof (part.output as { narrative: string }).narrative === "string" &&
                  (part.output as { narrative: string }).narrative.length > 0
              );

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

                  {/* Show Chain of Thought for multi-step reasoning - hide when FinalizeReport is complete */}
                  {message.role === "assistant" && hasMultipleTools && !finalizeReportComplete && (
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

                          // Create descriptive label based on tool name and input
                          const getToolLabel = (name: string, input: unknown): string => {
                            const baseLabel = name
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())
                              .trim();

                            // Add context from tool input if available
                            if (input && typeof input === "object" && input !== null) {
                              if (name === "SearchCatalog" && "query" in input && typeof input.query === "string") {
                                return `Searching catalog for: "${input.query}"`;
                              }
                              if (name === "SearchSchema" && "keyword" in input && typeof input.keyword === "string") {
                                return `Searching schema for: "${input.keyword}"`;
                              }
                              if (name === "ReadEntityYamlRaw" && "name" in input && typeof input.name === "string") {
                                return `Reading entity: ${input.name}`;
                              }
                              if (name === "AssessEntityCoverage" && "entity" in input && typeof input.entity === "string") {
                                return `Assessing coverage: ${input.entity}`;
                              }
                              if (name === "ScanEntityProperties" && "entity" in input && typeof input.entity === "string") {
                                return `Scanning properties: ${input.entity}`;
                              }
                              if (name === "ClarifyIntent" && "question" in input && typeof input.question === "string") {
                                return `Clarifying: ${input.question}`;
                              }
                              if (name === "LoadEntitiesBulk" && "names" in input && Array.isArray(input.names)) {
                                return `Loading ${input.names.length} entities`;
                              }
                            }

                            return baseLabel;
                          };

                          const toolInput = "input" in part ? part.input : undefined;
                          const label = getToolLabel(toolName, toolInput);

                          return (
                            <ChainOfThoughtStep
                              key={`${message.id}-tool-${idx}`}
                              label={label}
                              status={toolStatus}
                            />
                          );
                        })}
                      </ChainOfThoughtContent>
                    </ChainOfThought>
                  )}

                  {(() => {
                    // Use the finalizeReportComplete check from above scope

                    // Extract narrative from FinalizeReport tool input while streaming
                    const getStreamingNarrative = (): string | null => {
                      const finalizeReportPart = message.parts.find(
                        (part) =>
                          part.type?.startsWith("tool-FinalizeReport") &&
                          "input" in part &&
                          "state" in part &&
                          (part.state === "input-streaming" || part.state === "input-available")
                      );

                      if (finalizeReportPart && "input" in finalizeReportPart) {
                        const input = finalizeReportPart.input;
                        if (
                          typeof input === "object" &&
                          input !== null &&
                          "narrative" in input &&
                          typeof input.narrative === "string"
                        ) {
                          return input.narrative;
                        }
                      }
                      return null;
                    };

                    const streamingNarrative = isStreaming ? getStreamingNarrative() : null;

                    // Filter out tool parts if FinalizeReport is complete (we'll show them in collapsible)
                    const partsToRender = finalizeReportComplete
                      ? message.parts.filter(
                          (part) =>
                            !part.type?.startsWith("tool-") ||
                            part.type?.startsWith("tool-FinalizeReport")
                        )
                      : message.parts;

                    return (
                      <>
                        {/* Collapsible tool calls section - shown when FinalizeReport is complete */}
                        {finalizeReportComplete && (
                          <div className="flex w-full justify-start mb-4">
                            <Collapsible defaultOpen={false} className="max-w-[80%]">
                              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border bg-muted/50 p-3 text-sm font-medium hover:bg-muted transition-colors">
                                <span className="text-muted-foreground">
                                  View Tool Calls ({toolParts.length})
                                </span>
                                <ChevronDownIcon className="h-4 w-4 text-muted-foreground transition-transform data-[state=open]:rotate-180" />
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="mt-2 space-y-2">
                                  {message.parts
                                    .filter(
                                      (part) =>
                                        part.type?.startsWith("tool-") &&
                                        !part.type?.startsWith("tool-FinalizeReport")
                                    )
                                    .map((part, i) => {
                                      if (
                                        !part.type.startsWith("tool-") ||
                                        !("state" in part) ||
                                        !("input" in part)
                                      ) {
                                        return null;
                                      }

                                      const toolType = part.type as `tool-${string}`;
                                      const toolName = toolType.replace("tool-", "");

                                      return (
                                        <Tool key={`${message.id}-tool-collapsed-${i}`}>
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
                                                ) : null
                                              }
                                              errorText={part.errorText}
                                            />
                                          </ToolContent>
                                        </Tool>
                                      );
                                    })}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </div>
                        )}

                        {/* Render message parts */}
                        {partsToRender.map((part, i) => {
                          const isLastPart = i === partsToRender.length - 1;
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

                                // Don't render FinalizeReport tool UI if we're showing the narrative separately
                                if (toolName === "FinalizeReport" && finalizeReportComplete) {
                                  return null;
                                }

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
                      </>
                    );
                  })()}
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

                    // Find FinalizeReport part
                    const finalizeReportPart = message.parts.find(
                      (part) =>
                        part.type?.startsWith("tool-FinalizeReport") &&
                        "input" in part &&
                        "state" in part
                    );

                    if (!finalizeReportPart) {
                      return null;
                    }

                    // Extract narrative from input (streaming) or output (complete)
                    let narrative: string | null = null;
                    let isStreamingNarrative = false;

                    // Check for narrative in tool input (while streaming)
                    if (
                      "input" in finalizeReportPart &&
                      finalizeReportPart.input &&
                      typeof finalizeReportPart.input === "object" &&
                      "narrative" in finalizeReportPart.input &&
                      typeof finalizeReportPart.input.narrative === "string"
                    ) {
                      narrative = finalizeReportPart.input.narrative;
                      isStreamingNarrative =
                        isStreaming && 
                        (finalizeReportPart.state === "input-streaming" || 
                          finalizeReportPart.state === "input-available");
                    }

                    // Check for narrative in tool output (when complete)
                    if (
                      !narrative &&
                      "output" in finalizeReportPart &&
                      finalizeReportPart.output &&
                      typeof finalizeReportPart.output === "object" &&
                      "narrative" in finalizeReportPart.output &&
                      typeof finalizeReportPart.output.narrative === "string"
                    ) {
                      narrative = finalizeReportPart.output.narrative;
                    }

                    const isLastMessage = message.id === messages.at(-1)?.id;

                    if (narrative || isStreamingNarrative) {
                      return (
                        <Message from={message.role}>
                          <MessageContent>
                            {isStreamingNarrative ? (
                              narrative ? (
                                <Response>{narrative}</Response>
                              ) : (
                                <Shimmer>Generating report...</Shimmer>
                              )
                            ) : narrative ? (
                              <Response>{narrative}</Response>
                            ) : (
                              <Shimmer>Processing...</Shimmer>
                            )}
                          </MessageContent>
                          {narrative && isLastMessage && !isStreaming && (
                            <Actions className="mt-2">
                              <Action
                                onClick={() => regenerate()}
                                label="Retry"
                              >
                                <RefreshCcwIcon className="size-3" />
                              </Action>
                              <Action
                                onClick={() =>
                                  navigator.clipboard.writeText(narrative!)
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
