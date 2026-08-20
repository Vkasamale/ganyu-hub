import * as React from "react";

/** 40px-tall text field: white, neutral-300 border, 6px radius, teal 2px focus ring. */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
export function Input(props: InputProps): JSX.Element;
