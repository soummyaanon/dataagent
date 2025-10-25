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
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { Loader } from "@/components/ai-elements/loader";
import { useCanvasStore } from "@/hooks/useCanvasStore";
import type { VisualizationConfig } from "@/types/visualization";

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
            {messages.map((message) => (
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
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case "text":
                      return (
                        <Fragment key={`${message.id}-${i}`}>
                          <Message from={message.role}>
                            <MessageContent>
                              <Response>{part.text}</Response>
                            </MessageContent>
                          </Message>
                          {message.role === "assistant" &&
                            i === messages.length - 1 && (
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
                          isStreaming={
                            status === "streaming" &&
                            i === message.parts.length - 1 &&
                            message.id === messages.at(-1)?.id
                          }
                        >
                          <ReasoningTrigger />
                          <ReasoningContent>{part.text}</ReasoningContent>
                        </Reasoning>
                      );
                    default:
                      if (
                        part.type.startsWith("tool-") &&
                        "state" in part &&
                        "input" in part
                      ) {
                        const toolType = part.type as `tool-${string}`;
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
                {/* Display narrative from FinalizeReport as final result */}
                {message.role === "assistant" &&
                  (() => {
                    // Find FinalizeReport by checking for the specific output structure
                    const finalizeReportPart = message.parts.find(
                      (part) =>
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

                      if (output.narrative) {
                        return (
                          <Message from={message.role}>
                            <MessageContent>
                              <Response>{output.narrative}</Response>
                            </MessageContent>
                          </Message>
                        );
                      }
                    }
                    return null;
                  })()}
              </div>
            ))}
            {status === "submitted" && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

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
