"use client";

import Theme from "./plugins/Theme";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import { HeadingNode } from "@lexical/rich-text";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import {
  FloatingComposer,
  FloatingThreads,
  liveblocksConfig,
  LiveblocksPlugin,
  useEditorStatus,
} from "@liveblocks/react-lexical";
import FloatingToolbar from "./plugins/FloatingToolbar";
import { useThreads } from "@liveblocks/react/suspense";
import Loader from "../Loader";
import Comments from "../Comments";

function Placeholder() {
  return <div className="editor-placeholder">Enter some rich text...</div>;
}

const createInitialConfig = (currentUserType: UserType) =>
  liveblocksConfig({
    namespace: "Editor",
    nodes: [HeadingNode],
    onError: (error) => {
      console.error("Editor error:", error);
      throw error;
    },
    theme: Theme,
    editable: currentUserType === "editor",
  });

export function Editor({
  roomId,
  currentUserType,
}: {
  roomId: string;
  currentUserType: UserType;
}) {
  const status = useEditorStatus();
  const initialConfig = createInitialConfig(currentUserType);
  const { threads } = useThreads();

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container size-full">
        <div className="toolbar-wrapper flex min-w-full justify-between">
          <ToolbarPlugin />
          {/* Uncomment when DeleteModal is ready */}
          {/* {currentUserType === "editor" && <DeleteModal roomId={roomId} />} */}
        </div>

        <div className="editor-wrapper flex flex-col items-center justify-start">
          {status === "not-loaded" || status === "loading" ? (
            <Loader />
          ) : (
            <div
              className="editor-inner min-h-[1100px] relative 
              mb-5 h-fit w-full max-w-[800px] shadow-md lg:mb-10"
            >
              <RichTextPlugin
                contentEditable={
                  <ContentEditable className="editor-input h-full" />
                }
                placeholder={<Placeholder />}
                ErrorBoundary={LexicalErrorBoundary}
              />
              {currentUserType === "editor" && <FloatingToolbar />}
              <HistoryPlugin />
              <AutoFocusPlugin />
            </div>
          )}

          <LiveblocksPlugin>
            <FloatingComposer className="w-[350px]" />
            <FloatingThreads threads={threads} />
            <Comments />
          </LiveblocksPlugin>
        </div>
      </div>
    </LexicalComposer>
  );
}
