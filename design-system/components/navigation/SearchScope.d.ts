/**
 * Two-option search scope: hiring someone, or finding work. Each option carries
 * a sentence, because "Creatives" and "Jobs" mean nothing on a first visit.
 *
 * @startingPoint section="Navigation" subtitle="Search scope with explanatory sentences" viewport="700x140"
 */
export interface SearchScopeProps extends React.HTMLAttributes<HTMLDivElement> {
  current?: "creatives" | "jobs";
  onSelect?: (key: "creatives" | "jobs") => void;
}
export function SearchScope(props: SearchScopeProps): JSX.Element;
