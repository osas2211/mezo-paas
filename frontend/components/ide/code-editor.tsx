"use client"

import Editor, { OnMount, OnChange } from "@monaco-editor/react"
import type { editor } from "monaco-editor"
import { useCallback, useRef } from "react"
import {
  ALL_MEZO_COMPLETIONS,
  getMezoHoverDoc,
  MEZO_HOVER_DOCS,
} from "@/lib/ide/mezo-completions"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  onSave?: () => void
  readOnly?: boolean
  fontSize?: number
}

export default function CodeEditor({
  value,
  onChange,
  onSave,
  readOnly = false,
  fontSize = 14,
}: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  const handleEditorMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor

      // Define Mezo dark theme
      monaco.editor.defineTheme("mezo-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "comment", foreground: "6a737d", fontStyle: "italic" },
          { token: "keyword", foreground: "b3ec11" },
          { token: "string", foreground: "9ecbff" },
          { token: "number", foreground: "79b8ff" },
          { token: "type", foreground: "b392f0" },
        ],
        colors: {
          "editor.background": "#0a0a0a",
          "editor.foreground": "#e1e4e8",
          "editor.lineHighlightBackground": "#161b22",
          "editor.selectionBackground": "#3392FF44",
          "editorCursor.foreground": "#b3ec11",
          "editorLineNumber.foreground": "#484f58",
          "editorLineNumber.activeForeground": "#b3ec11",
          "editor.inactiveSelectionBackground": "#3392FF22",
        },
      })

      monaco.editor.setTheme("mezo-dark")

      // Add Ctrl+S save shortcut
      if (onSave) {
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
          onSave()
        })
      }

      // Configure Solidity language (basic setup)
      monaco.languages.register({ id: "solidity" })

      monaco.languages.setMonarchTokensProvider("solidity", {
        keywords: [
          "pragma",
          "solidity",
          "contract",
          "interface",
          "library",
          "abstract",
          "function",
          "modifier",
          "event",
          "struct",
          "enum",
          "mapping",
          "public",
          "private",
          "internal",
          "external",
          "view",
          "pure",
          "payable",
          "memory",
          "storage",
          "calldata",
          "returns",
          "return",
          "if",
          "else",
          "for",
          "while",
          "do",
          "break",
          "continue",
          "throw",
          "emit",
          "try",
          "catch",
          "revert",
          "require",
          "assert",
          "new",
          "delete",
          "import",
          "is",
          "using",
          "constructor",
          "receive",
          "fallback",
          "virtual",
          "override",
          "immutable",
          "constant",
          "indexed",
          "anonymous",
        ],
        typeKeywords: [
          "address",
          "bool",
          "string",
          "bytes",
          "bytes1",
          "bytes32",
          "uint",
          "uint8",
          "uint256",
          "int",
          "int256",
        ],
        operators: [
          "=",
          ">",
          "<",
          "!",
          "~",
          "?",
          ":",
          "==",
          "<=",
          ">=",
          "!=",
          "&&",
          "||",
          "++",
          "--",
          "+",
          "-",
          "*",
          "/",
          "&",
          "|",
          "^",
          "%",
          "<<",
          ">>",
          "+=",
          "-=",
          "*=",
          "/=",
          "&=",
          "|=",
          "^=",
          "%=",
          "<<=",
          ">>=",
        ],
        symbols: /[=><!~?:&|+\-*\/\^%]+/,
        tokenizer: {
          root: [
            [
              /[a-z_$][\w$]*/,
              {
                cases: {
                  "@typeKeywords": "type",
                  "@keywords": "keyword",
                  "@default": "identifier",
                },
              },
            ],
            [/[A-Z][\w\$]*/, "type.identifier"],
            { include: "@whitespace" },
            [/[{}()\[\]]/, "@brackets"],
            [/[<>](?!@symbols)/, "@brackets"],
            [/@symbols/, { cases: { "@operators": "operator", "@default": "" } }],
            [/\d*\.\d+([eE][\-+]?\d+)?/, "number.float"],
            [/0[xX][0-9a-fA-F]+/, "number.hex"],
            [/\d+/, "number"],
            [/[;,.]/, "delimiter"],
            [/"([^"\\]|\\.)*$/, "string.invalid"],
            [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],
            [/'[^\\']'/, "string"],
            [/'/, "string.invalid"],
          ],
          string: [
            [/[^\\"]+/, "string"],
            [/\\./, "string.escape"],
            [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }],
          ],
          whitespace: [
            [/[ \t\r\n]+/, "white"],
            [/\/\*/, "comment", "@comment"],
            [/\/\/.*$/, "comment"],
          ],
          comment: [
            [/[^\/*]+/, "comment"],
            [/\/\*/, "comment", "@push"],
            ["\\*/", "comment", "@pop"],
            [/[\/*]/, "comment"],
          ],
        },
      })

      // Map completion kinds
      const getCompletionKind = (kind: string) => {
        switch (kind) {
          case "snippet":
            return monaco.languages.CompletionItemKind.Snippet
          case "function":
            return monaco.languages.CompletionItemKind.Function
          case "interface":
            return monaco.languages.CompletionItemKind.Interface
          case "constant":
            return monaco.languages.CompletionItemKind.Constant
          case "keyword":
            return monaco.languages.CompletionItemKind.Keyword
          default:
            return monaco.languages.CompletionItemKind.Snippet
        }
      }

      // Basic Solidity autocompletion
      monaco.languages.registerCompletionItemProvider("solidity", {
        provideCompletionItems: (model: any, position: any) => {
          const word = model.getWordUntilPosition(position)
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          }

          const baseSuggestions = [
            {
              label: "pragma solidity",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: "pragma solidity ^${1:0.8.20};\n\n$0",
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: "Solidity version pragma",
              range,
            },
            {
              label: "contract",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText:
                "contract ${1:MyContract} {\n\t${2:// Your code here}\n}",
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: "Contract definition",
              range,
            },
            {
              label: "function",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText:
                "function ${1:myFunction}(${2:}) ${3:public} ${4:returns (${5:})} {\n\t$0\n}",
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: "Function definition",
              range,
            },
            {
              label: "constructor",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: "constructor(${1:}) {\n\t$0\n}",
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: "Constructor",
              range,
            },
            {
              label: "event",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: "event ${1:MyEvent}(${2:});",
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: "Event definition",
              range,
            },
            {
              label: "modifier",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: "modifier ${1:myModifier}() {\n\t_;\n}",
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: "Modifier definition",
              range,
            },
            {
              label: "require",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'require(${1:condition}, "${2:Error message}");',
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: "Require statement",
              range,
            },
            {
              label: "mapping",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: "mapping(${1:address} => ${2:uint256}) ${3:public} ${4:myMapping};",
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: "Mapping declaration",
              range,
            },
            {
              label: "import OpenZeppelin",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText:
                'import "@openzeppelin/contracts/${1:token/ERC20/ERC20.sol}";',
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: "Import OpenZeppelin contract",
              range,
            },
          ]

          return { suggestions: baseSuggestions }
        },
      })

      // Mezo-specific autocompletion with AI hints
      monaco.languages.registerCompletionItemProvider("solidity", {
        triggerCharacters: ["m", "M", "I", "v", "t", "b", "c", "p"],
        provideCompletionItems: (model: any, position: any) => {
          const word = model.getWordUntilPosition(position)
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          }

          // Convert Mezo completions to Monaco format
          const mezoSuggestions = ALL_MEZO_COMPLETIONS.map((completion) => ({
            label: {
              label: completion.label,
              detail: completion.detail ? ` - ${completion.detail}` : " (Mezo)",
              description: "Mezo AI",
            },
            kind: getCompletionKind(completion.kind),
            insertText: completion.insertText,
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: {
              value: `**${completion.detail || "Mezo Pattern"}**\n\n${completion.documentation}`,
              isTrusted: true,
            },
            range,
            sortText: "0" + completion.label, // Prioritize Mezo completions
          }))

          return { suggestions: mezoSuggestions }
        },
      })

      // Hover provider for Mezo documentation
      monaco.languages.registerHoverProvider("solidity", {
        provideHover: (model: any, position: any) => {
          const word = model.getWordAtPosition(position)
          if (!word) return null

          const hoverDoc = getMezoHoverDoc(word.word)
          if (!hoverDoc) return null

          return {
            range: {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endColumn: word.endColumn,
            },
            contents: [
              { value: "**Mezo**" },
              { value: hoverDoc },
            ],
          }
        },
      })

      // Focus editor
      editor.focus()
    },
    [onSave]
  )

  const handleChange: OnChange = useCallback(
    (value) => {
      onChange(value || "")
    },
    [onChange]
  )

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        defaultLanguage="solidity"
        value={value}
        onChange={handleChange}
        onMount={handleEditorMount}
        theme="mezo-dark"
        options={{
          fontSize,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          minimap: { enabled: true, scale: 0.75 },
          scrollBeyondLastLine: false,
          wordWrap: "on",
          lineNumbers: "on",
          renderLineHighlight: "all",
          automaticLayout: true,
          tabSize: 4,
          insertSpaces: true,
          formatOnPaste: true,
          formatOnType: true,
          readOnly,
          padding: { top: 16 },
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
        }}
        loading={
          <div className="flex items-center justify-center h-full bg-[#0a0a0a] text-white/60">
            Loading editor...
          </div>
        }
      />
    </div>
  )
}
