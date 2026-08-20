import * as React from "react";

/**
 * The white card. Everything raised off the paper ground is one of these.
 *
 * @startingPoint section="Core" subtitle="White card on paper, 16px radius, warm shadow" viewport="700x260"
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
export function Card(props: CardProps): JSX.Element;
export function CardHeader(props: React.HTMLAttributes<HTMLDivElement>): JSX.Element;
export function CardTitle(props: React.HTMLAttributes<HTMLHeadingElement>): JSX.Element;
export function CardDescription(props: React.HTMLAttributes<HTMLParagraphElement>): JSX.Element;
export function CardContent(props: React.HTMLAttributes<HTMLDivElement>): JSX.Element;
export function CardFooter(props: React.HTMLAttributes<HTMLDivElement>): JSX.Element;
