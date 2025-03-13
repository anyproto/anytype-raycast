export interface ObjectExport {
  path: string;
}

export interface Export {
  markdown: string;
}

export enum ExportFormat {
  Markdown = "markdown",
  Protobuf = "protobuf",
}
