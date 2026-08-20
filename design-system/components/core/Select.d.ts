import * as React from "react";

/** Styled native <select> — matches Input's height, border, radius and focus ring. */
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}
export function Select(props: SelectProps): JSX.Element;
