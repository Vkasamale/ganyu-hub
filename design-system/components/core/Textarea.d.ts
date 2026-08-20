import * as React from "react";

/** Multi-line field, min-height 100px. Identical skin to Input. */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
export function Textarea(props: TextareaProps): JSX.Element;
