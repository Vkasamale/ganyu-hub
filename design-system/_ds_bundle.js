/* @ds-bundle: {"format":4,"namespace":"GanyuHubDesignSystem_1b2ec0","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"CardHeader","sourcePath":"components/core/Card.jsx"},{"name":"CardTitle","sourcePath":"components/core/Card.jsx"},{"name":"CardDescription","sourcePath":"components/core/Card.jsx"},{"name":"CardContent","sourcePath":"components/core/Card.jsx"},{"name":"CardFooter","sourcePath":"components/core/Card.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"Label","sourcePath":"components/core/Label.jsx"},{"name":"Logo","sourcePath":"components/core/Logo.jsx"},{"name":"Select","sourcePath":"components/core/Select.jsx"},{"name":"Textarea","sourcePath":"components/core/Textarea.jsx"},{"name":"CreativeCard","sourcePath":"components/listings/CreativeCard.jsx"},{"name":"FeedCarousel","sourcePath":"components/listings/FeedCarousel.jsx"},{"name":"FeedCard","sourcePath":"components/listings/FeedCarousel.jsx"},{"name":"JobCard","sourcePath":"components/listings/JobCard.jsx"},{"name":"ServiceCard","sourcePath":"components/listings/ServiceCard.jsx"},{"name":"STAGES","sourcePath":"components/money/JobProgressBar.jsx"},{"name":"JobProgressBar","sourcePath":"components/money/JobProgressBar.jsx"},{"name":"MoneyInput","sourcePath":"components/money/MoneyInput.jsx"},{"name":"MONEY_STATES","sourcePath":"components/money/MoneyStamp.jsx"},{"name":"MoneyStamp","sourcePath":"components/money/MoneyStamp.jsx"},{"name":"PricingExplainer","sourcePath":"components/money/PricingExplainer.jsx"},{"name":"CLIENT_TABS","sourcePath":"components/navigation/BottomTabBar.jsx"},{"name":"CREATIVE_TABS","sourcePath":"components/navigation/BottomTabBar.jsx"},{"name":"BottomTabBar","sourcePath":"components/navigation/BottomTabBar.jsx"},{"name":"NavDrawer","sourcePath":"components/navigation/BottomTabBar.jsx"},{"name":"PageTabs","sourcePath":"components/navigation/PageTabs.jsx"},{"name":"CLIENT_NAV","sourcePath":"components/navigation/PrimaryNav.jsx"},{"name":"CREATIVE_NAV","sourcePath":"components/navigation/PrimaryNav.jsx"},{"name":"PrimaryNav","sourcePath":"components/navigation/PrimaryNav.jsx"},{"name":"SearchScope","sourcePath":"components/navigation/SearchScope.jsx"},{"name":"StickyActionBar","sourcePath":"components/navigation/StickyActionBar.jsx"},{"name":"EmptyState","sourcePath":"components/trust/EmptyState.jsx"},{"name":"SaveButton","sourcePath":"components/trust/SaveButton.jsx"},{"name":"StarRatingInput","sourcePath":"components/trust/StarRatingInput.jsx"},{"name":"Stars","sourcePath":"components/trust/Stars.jsx"},{"name":"STYLES","sourcePath":"components/trust/StyleSwatch.jsx"},{"name":"StyleSwatch","sourcePath":"components/trust/StyleSwatch.jsx"},{"name":"StyleChoices","sourcePath":"components/trust/StyleSwatch.jsx"},{"name":"TagInput","sourcePath":"components/trust/TagInput.jsx"},{"name":"VerifiedBadge","sourcePath":"components/trust/VerifiedBadge.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"a1db9294f9f5","components/core/Button.jsx":"4c2c9f5a39c9","components/core/Card.jsx":"8f023d1f7e6d","components/core/Icon.jsx":"61811998c8ee","components/core/Input.jsx":"60b5ff7dcc4a","components/core/Label.jsx":"0bd6219e528c","components/core/Logo.jsx":"3038de59703b","components/core/Select.jsx":"7f2ff36f950f","components/core/Textarea.jsx":"37315bd604a3","components/listings/CreativeCard.jsx":"25df723320fc","components/listings/FeedCarousel.jsx":"5357c5e4f9ab","components/listings/JobCard.jsx":"cec918a081f2","components/listings/ServiceCard.jsx":"60cf5efbced4","components/money/JobProgressBar.jsx":"91a38146183f","components/money/MoneyInput.jsx":"065315c101f7","components/money/MoneyStamp.jsx":"6951089032e7","components/money/PricingExplainer.jsx":"9aea1e457483","components/navigation/BottomTabBar.jsx":"a44b1bf2c65e","components/navigation/PageTabs.jsx":"0966d5a4399f","components/navigation/PrimaryNav.jsx":"56ecef769bf5","components/navigation/SearchScope.jsx":"bfb863b99507","components/navigation/StickyActionBar.jsx":"03d02ab7d96d","components/trust/EmptyState.jsx":"5e1179b36903","components/trust/SaveButton.jsx":"6defcd7dc6ca","components/trust/StarRatingInput.jsx":"5ca5b1af37af","components/trust/Stars.jsx":"5215bc259856","components/trust/StyleSwatch.jsx":"712921d6e898","components/trust/TagInput.jsx":"e33eeafc4e5e","components/trust/VerifiedBadge.jsx":"98531b234441","ui_kits/data.js":"46970ab23c66","ui_kits/mobile/MobileScreens.jsx":"8e7f241f86d0","ui_kits/web/BrowseCreatives.jsx":"8b67d68b6093","ui_kits/web/JobDetail.jsx":"bc05789c1d3f","ui_kits/web/JobsList.jsx":"fb1f2a28b2b7","ui_kits/web/MarketingHome.jsx":"9bcb38ca6c9f","ui_kits/web/WebShell.jsx":"d1cc2ce5542d"},"inlinedExternals":[],"unexposedExports":[{"name":"stampUrl","sourcePath":"components/money/MoneyStamp.jsx"}]} */

(() => {

const __ds_ns = (window.GanyuHubDesignSystem_1b2ec0 = window.GanyuHubDesignSystem_1b2ec0 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  neutral: {
    background: "#f5f5f5",
    borderColor: "#e5e5e5",
    color: "#404040"
  },
  chip: {
    background: "var(--gh-ink-05)",
    borderColor: "transparent",
    color: "var(--gh-ink-70)"
  },
  wash: {
    background: "rgba(218,207,178,0.70)",
    borderColor: "transparent",
    color: "var(--gh-ink-75)"
  },
  mark: {
    background: "var(--gh-mark-10)",
    borderColor: "transparent",
    color: "var(--gh-mark)"
  },
  teal: {
    background: "var(--gh-teal-10)",
    borderColor: "var(--gh-teal-25)",
    color: "var(--gh-teal-dark)"
  }
};

/** Pill label. Not a button — never put a click on one. */
function Badge({
  tone = "neutral",
  style,
  children,
  ...rest
}) {
  const t = TONES[tone] || TONES.neutral;
  return /*#__PURE__*/React.createElement("span", _extends({}, rest, {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      borderRadius: "var(--radius-pill)",
      border: "1px solid " + t.borderColor,
      background: t.background,
      color: t.color,
      padding: "2px 10px",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-xs)",
      fontWeight: "var(--weight-medium)",
      whiteSpace: "nowrap",
      ...style
    }
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: {
    height: 36,
    padding: "0 12px"
  },
  default: {
    height: 40,
    padding: "8px 16px"
  },
  lg: {
    height: 44,
    padding: "0 24px"
  }
};

/** Ganyu Hub button. Teal default, 6px radius, 150ms ease-out, active:scale(0.97). */
function Button({
  variant = "default",
  size = "default",
  disabled = false,
  style,
  children,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const link = variant === "link";
  const skin = {
    default: {
      background: hover ? "var(--gh-teal-dark)" : "var(--gh-teal)",
      color: "var(--text-on-teal)",
      border: "1px solid transparent",
      boxShadow: hover ? "0 1px 3px rgba(0,0,0,0.12)" : "0 1px 2px rgba(0,0,0,0.05)"
    },
    outline: {
      background: hover ? "#fafafa" : "var(--gh-white)",
      color: "var(--text-body)",
      border: "1px solid " + (hover ? "var(--border-control-hover)" : "var(--border-control)")
    },
    ghost: {
      background: hover ? "#f5f5f5" : "transparent",
      color: "var(--text-body)",
      border: "1px solid transparent"
    },
    link: {
      background: "transparent",
      color: "var(--gh-teal)",
      border: "1px solid transparent",
      textDecoration: hover ? "underline" : "none",
      textUnderlineOffset: 4
    }
  }[variant];
  return /*#__PURE__*/React.createElement("button", _extends({}, rest, {
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      userSelect: "none",
      cursor: disabled ? "default" : "pointer",
      borderRadius: "var(--radius-control)",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-medium)",
      lineHeight: 1,
      whiteSpace: "nowrap",
      height: link ? "auto" : SIZES[size].height,
      padding: link ? 0 : SIZES[size].padding,
      transitionProperty: "background-color,box-shadow,transform,color,border-color",
      transitionDuration: "var(--dur-control)",
      transitionTimingFunction: "var(--ease-out)",
      transform: press && !disabled ? "scale(var(--press-scale))" : "none",
      opacity: disabled ? 0.5 : 1,
      pointerEvents: disabled ? "none" : undefined,
      ...skin,
      ...style
    }
  }), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** The white surface that lifts off the paper ground. 16px radius, warm 3-layer shadow. */
function Card({
  style,
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      borderRadius: "var(--radius-card)",
      border: "var(--elev-1-border)",
      background: "var(--surface-card)",
      boxShadow: "var(--elev-1)",
      ...style
    }
  }), children);
}
function CardHeader({
  style,
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      padding: 24,
      ...style
    }
  }), children);
}
function CardTitle({
  style,
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("h3", _extends({}, rest, {
    style: {
      margin: 0,
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-base)",
      fontWeight: "var(--weight-semibold)",
      lineHeight: 1,
      letterSpacing: "var(--tracking-display)",
      color: "var(--text-body)",
      ...style
    }
  }), children);
}
function CardDescription({
  style,
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("p", _extends({}, rest, {
    style: {
      margin: 0,
      fontSize: "var(--text-sm)",
      color: "#737373",
      textWrap: "pretty",
      ...style
    }
  }), children);
}
function CardContent({
  style,
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      minWidth: 0,
      overflowWrap: "break-word",
      padding: "0 24px 24px",
      ...style
    }
  }), children);
}
function CardFooter({
  style,
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: "flex",
      alignItems: "center",
      padding: "0 24px 24px",
      ...style
    }
  }), children);
}
Object.assign(__ds_scope, { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * INTENTIONAL ADDITION (see readme.md). The product uses lucide-react
 * throughout — components/nav-icons.tsx is the one place that maps nav keys to
 * Lucide components. There is no icon primitive in the codebase because React
 * imports do that job; in a browser-only design system we need a wrapper.
 *
 * Renders from the Lucide UMD build on `window.lucide` (load it from CDN in the
 * page: https://unpkg.com/lucide@0.469.0/dist/umd/lucide.min.js). Falls back to
 * nothing rather than to a wrong glyph.
 *
 * Names are Lucide PascalCase: Home, Search, MessageSquare, Briefcase, Wallet,
 * Menu, BadgeCheck, ArrowRight, ShieldCheck, HandCoins, Scale, ChevronDown …
 */
function Icon({
  name,
  size = 20,
  strokeWidth = 2,
  color = "currentColor",
  style,
  ...rest
}) {
  const lib = typeof window !== "undefined" && window.lucide ? window.lucide.icons || window.lucide : null;
  const node = lib ? lib[name] : null;
  const children = !node ? [] : Array.isArray(node) && node[0] === "svg" ? node[2] : node;
  return /*#__PURE__*/React.createElement("svg", _extends({}, rest, {
    viewBox: "0 0 24 24",
    width: size,
    height: size,
    fill: "none",
    stroke: color,
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    style: {
      display: "block",
      flexShrink: 0,
      outline: "none",
      ...style
    }
  }), (children || []).map((c, i) => React.createElement(c[0], {
    key: i,
    ...c[1]
  })));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** 40px text field. Same height, border, radius and focus ring as Select. */
function Input({
  disabled = false,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("input", _extends({}, rest, {
    disabled: disabled,
    onFocus: e => {
      setFocus(true);
      rest.onFocus && rest.onFocus(e);
    },
    onBlur: e => {
      setFocus(false);
      rest.onBlur && rest.onBlur(e);
    },
    style: {
      display: "flex",
      height: 40,
      padding: "8px 12px",
      width: "100%",
      boxSizing: "border-box",
      borderRadius: "var(--radius-control)",
      border: "1px solid var(--border-control)",
      background: "var(--gh-white)",
      color: "var(--text-body)",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-sm)",
      outline: focus ? "2px solid var(--focus-ring)" : "none",
      outlineOffset: 0,
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  }));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/Label.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Field label: 14px, medium, leading-none. */
function Label({
  style,
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", _extends({}, rest, {
    style: {
      display: "block",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-medium)",
      lineHeight: 1,
      color: "var(--text-body)",
      ...style
    }
  }), children);
}
Object.assign(__ds_scope, { Label });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Label.jsx", error: String((e && e.message) || e) }); }

// components/core/Logo.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const DIM = {
  sm: 25,
  md: 32,
  lg: 41
};
const WORD = {
  sm: "var(--text-base)",
  md: "var(--text-xl)",
  lg: "var(--text-2xl)"
};

/** Mark plus wordmark. "Ganyu" in ink, "Hub" at 60%. Mark is always circular. */
function Logo({
  size = "md",
  markSrc = "assets/logo-g.png",
  wordmark = true,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({}, rest, {
    style: {
      display: "inline-flex",
      flexShrink: 0,
      alignItems: "center",
      gap: 8,
      ...style
    }
  }), /*#__PURE__*/React.createElement("img", {
    src: markSrc,
    alt: "Ganyu Hub",
    width: DIM[size],
    height: DIM[size],
    style: {
      flexShrink: 0,
      borderRadius: "var(--radius-pill)",
      display: "block",
      outline: "none"
    }
  }), wordmark && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: WORD[size],
      fontWeight: 600,
      lineHeight: 1,
      letterSpacing: "-0.025em",
      color: "var(--gh-ink)",
      whiteSpace: "nowrap"
    }
  }, "Ganyu ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--gh-ink-60)"
    }
  }, "Hub")));
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Logo.jsx", error: String((e && e.message) || e) }); }

// components/core/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CHEVRON = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%231a1611' stroke-opacity='0.45' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")";

/** Styled native <select>. Native on purpose: no JS, mobile pickers come free. */
function Select({
  disabled = false,
  style,
  children,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("select", _extends({}, rest, {
    disabled: disabled,
    onFocus: e => {
      setFocus(true);
      rest.onFocus && rest.onFocus(e);
    },
    onBlur: e => {
      setFocus(false);
      rest.onBlur && rest.onBlur(e);
    },
    style: {
      display: "flex",
      height: 40,
      appearance: "none",
      WebkitAppearance: "none",
      padding: "8px 36px 8px 12px",
      backgroundImage: CHEVRON,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 0.75rem center",
      backgroundSize: "12px 8px",
      width: "100%",
      boxSizing: "border-box",
      borderRadius: "var(--radius-control)",
      border: "1px solid var(--border-control)",
      background: "var(--gh-white)",
      color: "var(--text-body)",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-sm)",
      outline: focus ? "2px solid var(--focus-ring)" : "none",
      outlineOffset: 0,
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  }), children);
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Select.jsx", error: String((e && e.message) || e) }); }

// components/core/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Multi-line field. Matches Input, with a 100px floor. */
function Textarea({
  disabled = false,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("textarea", _extends({}, rest, {
    disabled: disabled,
    onFocus: e => {
      setFocus(true);
      rest.onFocus && rest.onFocus(e);
    },
    onBlur: e => {
      setFocus(false);
      rest.onBlur && rest.onBlur(e);
    },
    style: {
      display: "flex",
      minHeight: 100,
      padding: "8px 12px",
      lineHeight: "var(--leading-normal)",
      resize: "vertical",
      width: "100%",
      boxSizing: "border-box",
      borderRadius: "var(--radius-control)",
      border: "1px solid var(--border-control)",
      background: "var(--gh-white)",
      color: "var(--text-body)",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-sm)",
      outline: focus ? "2px solid var(--focus-ring)" : "none",
      outlineOffset: 0,
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  }));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/listings/FeedCarousel.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * A horizontal rail with a "See all". The row MUST peek: the next card stays
 * deliberately half-visible at the right edge, because that is the only thing
 * telling anyone the row scrolls. A row ending flush reads as a static grid.
 *
 * No arrows, no carousel library — CSS scroll-snap. Arrows solve a problem
 * desktop does not have.
 */
function FeedCarousel({
  title,
  eyebrow,
  seeAllHref,
  seeAllLabel = "See all",
  action,
  count = 1,
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  if (count === 0) return null;
  return /*#__PURE__*/React.createElement("section", _extends({}, rest, {
    style: style
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", null, eyebrow && /*#__PURE__*/React.createElement("p", {
    className: "gh-eyebrow",
    style: {
      margin: 0,
      color: "var(--gh-ink-55)"
    }
  }, eyebrow), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: "4px 0 0",
      fontSize: "var(--text-lg)",
      fontWeight: "var(--weight-semibold)",
      color: "var(--gh-ink)"
    }
  }, title)), action, !action && seeAllHref && /*#__PURE__*/React.createElement("a", {
    href: seeAllHref,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-medium)",
      color: "var(--gh-teal-dark)",
      textDecoration: hover ? "underline" : "none"
    }
  }, seeAllLabel, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "ArrowRight",
    size: 16,
    style: {
      transform: hover ? "translateX(2px)" : "none",
      transition: "transform var(--dur-control) var(--ease-out)"
    }
  }))), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: "16px 0 0",
      padding: "0 var(--carousel-peek) 8px 0",
      listStyle: "none",
      display: "flex",
      gap: "var(--carousel-gap)",
      overflowX: "auto",
      scrollSnapType: "x mandatory",
      scrollbarWidth: "none"
    }
  }, children));
}

/** One slide. Fixed width so the peek is predictable at every breakpoint. */
function FeedCard({
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("li", _extends({}, rest, {
    style: {
      width: "var(--carousel-card)",
      flexShrink: 0,
      scrollSnapAlign: "start",
      ...style
    }
  }), children);
}
Object.assign(__ds_scope, { FeedCarousel, FeedCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/listings/FeedCarousel.jsx", error: String((e && e.message) || e) }); }

// components/money/JobProgressBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const STAGES = [{
  key: "posted",
  label: "Posted"
}, {
  key: "hired",
  label: "Creative hired"
}, {
  key: "funded",
  label: "Money in escrow"
}, {
  key: "delivered",
  label: "Work delivered"
}, {
  key: "released",
  label: "Money released"
}];
const COLORS = [{
  dot: "var(--stage-1)",
  ring: "rgba(14,165,233,0.25)",
  text: "#0369a1"
}, {
  dot: "var(--stage-2)",
  ring: "rgba(99,102,241,0.25)",
  text: "#4338ca"
}, {
  dot: "var(--stage-3)",
  ring: "rgba(139,92,246,0.25)",
  text: "#6d28d9"
}, {
  dot: "var(--stage-4)",
  ring: "rgba(245,158,11,0.25)",
  text: "#b45309"
}, {
  dot: "var(--stage-5)",
  ring: "rgba(5,150,105,0.25)",
  text: "#047857"
}];

/** Five stages, in order, each its own colour. Connectors fill on mount. */
function JobProgressBar({
  currentIdx = 0,
  overlay = null,
  style,
  ...rest
}) {
  const [mounted, setMounted] = React.useState(false);
  // min-w-[520px] sm:min-w-0 — the floor keeps the five stages legible on a
  // phone (the row scrolls), then drops away so the tracker fits its container.
  const [wide, setWide] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  React.useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);
  const dead = overlay && overlay.kind === "cancelled";
  const overlayColor = dead ? "var(--stage-cancelled)" : "var(--stage-4)";
  const overlayLabel = dead ? "Cancelled here" : "Disputed here";
  const connector = (filled, color, delay) => /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      height: 4,
      flex: 1,
      overflow: "hidden",
      borderRadius: 999,
      background: "#e5e5e5"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      background: color,
      width: filled ? "100%" : "0%",
      transition: "width var(--dur-progress) var(--ease-out)",
      transitionDelay: delay
    }
  }));
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      width: "100%",
      overflowX: "auto",
      padding: "8px 0",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("ol", {
    "aria-label": "Job progress",
    style: {
      display: "flex",
      minWidth: wide ? 0 : 520,
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 8,
      padding: "0 8px",
      margin: 0,
      listStyle: "none"
    }
  }, STAGES.map((s, i) => {
    const done = !dead && i < currentIdx;
    const current = !dead && i === currentIdx;
    const isOverlay = overlay && overlay.stageIdx === i;
    const c = COLORS[i];
    const delay = i * 180 + "ms";
    const fill = isOverlay ? overlayColor : done || current ? c.dot : "#f5f5f5";
    return /*#__PURE__*/React.createElement("li", {
      key: s.key,
      style: {
        display: "flex",
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        width: "100%",
        alignItems: "center"
      }
    }, i > 0 && connector(!dead && mounted && i <= currentIdx, (COLORS[i - 1] || c).dot, delay), /*#__PURE__*/React.createElement("div", {
      "aria-current": current ? "step" : undefined,
      style: {
        display: "flex",
        height: 32,
        width: 32,
        flexShrink: 0,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "var(--radius-pill)",
        border: "2px solid " + (done || current || isOverlay ? "transparent" : "var(--stage-idle-border)"),
        background: fill,
        color: done || current || isOverlay ? "#fff" : "var(--stage-idle-text)",
        fontSize: "var(--text-xs)",
        fontWeight: "var(--weight-semibold)",
        boxShadow: current ? "0 0 0 4px " + c.ring : "none",
        transform: current ? "scale(1.1)" : "none",
        transition: "all 500ms var(--ease-out)",
        transitionDelay: delay
      }
    }, isOverlay ? "!" : done ? "\u2713" : current ? "" : i + 1), i < STAGES.length - 1 && connector(!dead && mounted && i < currentIdx, c.dot, delay)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-11)",
        lineHeight: "var(--leading-tight)",
        fontWeight: current || isOverlay ? "var(--weight-semibold)" : 400,
        color: isOverlay ? "var(--gh-ink)" : current ? c.text : done ? "var(--gh-ink-70)" : "var(--stage-idle-text)"
      }
    }, s.label, isOverlay && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 2,
        fontSize: "var(--text-10)",
        fontWeight: "var(--weight-semibold)",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        color: dead ? "#b91c1c" : "#b45309"
      }
    }, overlayLabel)), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 2,
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-10)",
        fontVariantNumeric: "tabular-nums",
        color: "var(--stage-idle-text)"
      }
    }, i + 1));
  })));
}
Object.assign(__ds_scope, { STAGES, JobProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/money/JobProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/money/MoneyInput.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** MWK amount field: shows thousands separators as you type, submits raw digits. */
function MoneyInput({
  name,
  defaultValue = null,
  onValueChange,
  style,
  ...rest
}) {
  const [raw, setRaw] = React.useState(defaultValue != null ? String(defaultValue) : "");
  const display = raw === "" ? "" : Number(raw).toLocaleString("en-US");
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      display: "block",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      position: "absolute",
      left: 12,
      top: "50%",
      transform: "translateY(-50%)",
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-bold)",
      color: "var(--gh-teal)",
      pointerEvents: "none"
    }
  }, "k"), /*#__PURE__*/React.createElement(__ds_scope.Input, _extends({}, rest, {
    type: "text",
    inputMode: "numeric",
    value: display,
    onChange: e => {
      const next = e.target.value.replace(/[^\d]/g, "");
      setRaw(next);
      onValueChange && onValueChange(next);
    },
    style: {
      paddingLeft: 30,
      fontFamily: "var(--font-mono)",
      fontVariantNumeric: "tabular-nums"
    }
  })), /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: name,
    value: raw
  }));
}
Object.assign(__ds_scope, { MoneyInput });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/money/MoneyInput.jsx", error: String((e && e.message) || e) }); }

// components/money/MoneyStamp.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * The product's signature device: the five stages a job's money passes through,
 * each as a pressed rubber stamp. Never grey for all five — grey reads as
 * "nothing changed", and these are the five most consequential facts in the
 * product.
 *
 * The stamps are supplied artwork in `assets/stamps/`, not drawn in code. Each
 * carries "Ganyu Hub" arced around a double ring with the state on an angled
 * label band, worn and unevenly inked. Do not substitute a chip, a badge, or a
 * coded imitation — the wear is the point, and it cannot be faked with a border.
 *
 * The label text is part of the artwork, so `label` only retitles the image for
 * screen readers and tooltips; it cannot change what the stamp reads.
 */
const MONEY_STATES = {
  none: {
    label: "No payment yet",
    slug: "no-payment-yet",
    ink: "#8C8C8C"
  },
  payment_pending: {
    label: "Payment pending",
    slug: "payment-pending",
    ink: "#E9A23B"
  },
  payment_held: {
    label: "In escrow",
    slug: "in-escrow",
    ink: "#1D6E9E"
  },
  payment_released: {
    label: "Released",
    slug: "released",
    ink: "#1B9455"
  },
  payment_disputed: {
    label: "In dispute",
    slug: "in-dispute",
    ink: "#C22A2A"
  }
};
const SIZES = {
  sm: 80,
  md: 104,
  lg: 148
};

/* The artwork lives at the design system's root, but a consuming page can sit at
   any depth. Derive the folder from the bundle's own src so the same component
   resolves correctly from a component card, a UI kit, or a template. */
let _base;
/** Absolute-or-relative URL for a stamp PNG by slug. Lowercase on purpose: an
    internal helper, not part of the public namespace. */
function stampUrl(slug) {
  return stampBase() + slug + ".png";
}
function stampBase() {
  if (_base === undefined) {
    let found = "assets/stamps/";
    try {
      const tag = document.querySelector('script[src*="_ds_bundle.js"]');
      if (tag) found = tag.getAttribute("src").replace(/_ds_bundle\.js.*$/, "") + "assets/stamps/";
    } catch (e) {/* non-browser render: fall back to the project-root path */}
    _base = found;
  }
  return _base;
}
function MoneyStamp({
  state = "none",
  label,
  size = "md",
  basePath,
  style,
  ...rest
}) {
  const s = MONEY_STATES[state] || MONEY_STATES.none;
  const px = SIZES[size] || SIZES.md;
  const alt = label || s.label;
  return /*#__PURE__*/React.createElement("img", _extends({}, rest, {
    src: (basePath || stampBase()) + s.slug + ".png",
    alt: alt,
    title: alt,
    width: px,
    height: px,
    loading: "lazy",
    decoding: "async",
    style: {
      display: "block",
      flexShrink: 0,
      width: px,
      height: px,
      userSelect: "none",
      ...style
    }
  }));
}
Object.assign(__ds_scope, { MONEY_STATES, stampUrl, MoneyStamp });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/money/MoneyStamp.jsx", error: String((e && e.message) || e) }); }

// components/money/PricingExplainer.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * "How the money works", as a native <details>. Zero JS, works before
 * hydration. Numbers come from one source so the copy never drifts.
 */
function PricingExplainer({
  audience = "both",
  betaZeroCommission = true,
  platformCommission = 0.1,
  payoutRate = 0.03,
  bankFlatFee = 700,
  style,
  ...rest
}) {
  const commissionLine = betaZeroCommission ? "During beta, Ganyu Hub takes no commission — the creative keeps the full agreed price." : "Ganyu Hub keeps a " + Math.round(platformCommission * 100) + "% platform commission from the agreed price.";
  const forClient = audience !== "creative";
  const n = i => forClient ? i : i - 1;
  const step = {
    marginBottom: 8
  };
  const strong = {
    fontWeight: "var(--weight-medium)",
    color: "var(--gh-ink)"
  };
  return /*#__PURE__*/React.createElement("details", _extends({}, rest, {
    style: {
      borderRadius: "var(--radius-inset)",
      border: "1px solid var(--border-inset)",
      background: "var(--surface-inset)",
      padding: "12px 16px",
      fontSize: "var(--text-sm)",
      color: "var(--gh-ink-80)",
      ...style
    }
  }), /*#__PURE__*/React.createElement("summary", {
    style: {
      cursor: "pointer",
      listStyle: "none",
      fontWeight: "var(--weight-medium)",
      color: "var(--gh-ink)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8
    }
  }, "How the money works", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      fontWeight: 400,
      color: "var(--gh-ink-45)"
    }
  }, "(tap to expand)"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      overflowWrap: "break-word"
    }
  }, /*#__PURE__*/React.createElement("ol", {
    style: {
      margin: 0,
      padding: 0,
      listStyle: "none"
    }
  }, /*#__PURE__*/React.createElement("li", {
    style: step
  }, /*#__PURE__*/React.createElement("span", {
    style: strong
  }, "1. Agree a price."), " The creative\u2019s bid is the price for the work."), forClient && /*#__PURE__*/React.createElement("li", {
    style: step
  }, /*#__PURE__*/React.createElement("span", {
    style: strong
  }, "2. Client pays into escrow."), " The client pays the agreed price plus a small mobile-money/card processing fee (~3%). The money is ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: "var(--weight-medium)"
    }
  }, "held safely"), " \u2014 the creative can\u2019t touch it yet."), /*#__PURE__*/React.createElement("li", {
    style: step
  }, /*#__PURE__*/React.createElement("span", {
    style: strong
  }, n(3), ". Work happens."), " The creative delivers; the client reviews and approves."), /*#__PURE__*/React.createElement("li", {
    style: step
  }, /*#__PURE__*/React.createElement("span", {
    style: strong
  }, n(4), ". Payout."), " On approval, escrow is released to the creative. ", commissionLine, " A payout fee of", " ", Math.round(payoutRate * 100), "% is taken by the mobile-money/bank provider on the transfer out (bank transfers add a flat MWK ", bankFlatFee.toLocaleString(), ").")), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 12,
      fontSize: "var(--text-xs)",
      color: "var(--gh-ink-55)"
    }
  }, "Every figure you see on the platform (what the client pays, what the creative receives) already includes these fees, so there are no surprises at checkout."), /*#__PURE__*/React.createElement("a", {
    href: "/how-money-works",
    style: {
      display: "inline-block",
      marginTop: 8,
      fontSize: "var(--text-xs)",
      fontWeight: "var(--weight-medium)",
      color: "var(--gh-teal-dark)",
      textDecoration: "underline"
    }
  }, "Full breakdown & live calculator \u2192")));
}
Object.assign(__ds_scope, { PricingExplainer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/money/PricingExplainer.jsx", error: String((e && e.message) || e) }); }

// components/navigation/BottomTabBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * The mobile shell. Four destinations plus Menu — and NO create action in the
 * bar: a "+" between two tabs is the button people hit by accident, and posting
 * a job is a deliberate act that deserves a deliberate button.
 *
 * The app is installable, so in standalone mode there is no browser back
 * button. The drawer is grouped (Your work / Settings / Help) with the version
 * at the foot, because thirteen flat rows is a list you scan once and give up
 * on.
 */
const CLIENT_TABS = [{
  href: "/",
  label: "Home",
  icon: "Home"
}, {
  href: "/browse",
  label: "Find someone",
  icon: "Search"
}, {
  href: "/messages",
  label: "Messages",
  icon: "MessageSquare"
}, {
  href: "/dashboard/jobs",
  label: "My work",
  icon: "Briefcase"
}];
const CREATIVE_TABS = [{
  href: "/",
  label: "Home",
  icon: "Home"
}, {
  href: "/jobs",
  label: "Find work",
  icon: "Search"
}, {
  href: "/messages",
  label: "Messages",
  icon: "MessageSquare"
}, {
  href: "/dashboard/jobs",
  label: "My work",
  icon: "Briefcase"
}];
function BottomTabBar({
  tabs = CREATIVE_TABS,
  active = "/",
  unreadCount = 0,
  onNavigate,
  onMenu,
  position = "fixed",
  style,
  ...rest
}) {
  const cell = on => ({
    position: "relative",
    display: "flex",
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    padding: "8px 4px",
    minHeight: 44,
    border: 0,
    background: "none",
    cursor: "pointer",
    fontFamily: "var(--font-body)",
    fontSize: "var(--text-10)",
    fontWeight: "var(--weight-medium)",
    color: on ? "var(--gh-teal-dark)" : "var(--gh-ink-55)",
    textDecoration: "none"
  });
  return /*#__PURE__*/React.createElement("nav", _extends({}, rest, {
    "aria-label": "Main",
    style: {
      position,
      insetInline: 0,
      bottom: 0,
      zIndex: 40,
      borderTop: "1px solid var(--gh-ink-10)",
      background: "var(--surface-bar)",
      backdropFilter: "blur(8px)",
      boxShadow: "var(--elev-2)",
      paddingBottom: "env(safe-area-inset-bottom)",
      ...style
    }
  }), /*#__PURE__*/React.createElement("ul", {
    style: {
      display: "flex",
      alignItems: "stretch",
      margin: 0,
      padding: 0,
      listStyle: "none"
    }
  }, tabs.map(t => {
    const on = active === t.href;
    return /*#__PURE__*/React.createElement("li", {
      key: t.href,
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("a", {
      href: t.href,
      "aria-current": on ? "page" : undefined,
      onClick: e => {
        if (onNavigate) {
          e.preventDefault();
          onNavigate(t.href);
        }
      },
      style: cell(on)
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: t.icon,
      size: 20
    }), t.href === "/messages" && unreadCount > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        right: "22%",
        top: 4,
        minWidth: 16,
        borderRadius: "var(--radius-pill)",
        background: "var(--gh-teal)",
        padding: "0 4px",
        fontSize: "var(--text-9)",
        fontWeight: "var(--weight-bold)",
        lineHeight: "16px",
        color: "var(--gh-ground)",
        textAlign: "center"
      }
    }, unreadCount > 9 ? "9+" : unreadCount), /*#__PURE__*/React.createElement("span", {
      style: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, t.label)));
  }), /*#__PURE__*/React.createElement("li", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onMenu,
    "aria-haspopup": "menu",
    style: cell(false)
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "Menu",
    size: 20
  }), /*#__PURE__*/React.createElement("span", null, "Menu")))));
}

/** The grouped drawer the Menu tab opens. Paper sheet, shadow pointing up. */
function NavDrawer({
  groups = [],
  version = "1.0.0",
  onClose,
  onNavigate,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      position: "absolute",
      inset: 0,
      zIndex: 50,
      ...style
    }
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Close menu",
    onClick: onClose,
    style: {
      position: "absolute",
      inset: 0,
      border: 0,
      background: "var(--surface-scrim)",
      cursor: "pointer"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      insetInline: 0,
      bottom: 0,
      maxHeight: "85%",
      overflowY: "auto",
      borderTopLeftRadius: "var(--radius-card-lg)",
      borderTopRightRadius: "var(--radius-card-lg)",
      background: "var(--surface-sheet)",
      paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)",
      boxShadow: "var(--shadow-sheet)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "sticky",
      top: 0,
      display: "flex",
      justifyContent: "center",
      background: "var(--surface-sheet)",
      padding: "12px 0"
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      height: 4,
      width: 40,
      borderRadius: "var(--radius-pill)",
      background: "var(--gh-ink-15)"
    }
  })), groups.map(g => /*#__PURE__*/React.createElement("nav", {
    key: g.title,
    style: {
      borderTop: "1px solid var(--gh-ink-07)",
      padding: "8px"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      padding: "6px 12px",
      fontSize: "var(--text-11)",
      fontWeight: "var(--weight-semibold)",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      color: "var(--gh-ink-45)"
    }
  }, g.title), g.items.map(it => /*#__PURE__*/React.createElement("a", {
    key: it.href + it.label,
    href: it.href,
    onClick: e => {
      if (onNavigate) {
        e.preventDefault();
        onNavigate(it.href);
      }
    },
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      borderRadius: "var(--radius-panel)",
      padding: "10px 12px",
      fontSize: "var(--text-sm)",
      color: "var(--gh-ink-80)",
      textDecoration: "none",
      minHeight: 44,
      boxSizing: "border-box"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: it.icon,
    size: 18,
    color: "var(--gh-ink-45)"
  }), /*#__PURE__*/React.createElement("span", null, it.label))))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--gh-ink-07)",
      padding: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    style: {
      display: "flex",
      width: "100%",
      alignItems: "center",
      gap: 12,
      borderRadius: "var(--radius-panel)",
      border: 0,
      background: "none",
      padding: "10px 12px",
      textAlign: "left",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-medium)",
      color: "var(--status-danger)",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "ExternalLink",
    size: 18
  }), "Log out")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      padding: "8px 20px 0",
      textAlign: "center",
      fontSize: "var(--text-xs)",
      color: "var(--gh-ink-40)"
    }
  }, "Ganyu Hub v", version)));
}
Object.assign(__ds_scope, { CLIENT_TABS, CREATIVE_TABS, BottomTabBar, NavDrawer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/BottomTabBar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/PageTabs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Sub-tabs under a page title. Underline rather than filled pills: a filled
 * dark pill reads as a BUTTON — something that acts — where a tab only changes
 * what you are looking at.
 *
 * Counts are omitted at zero rather than shown as "0"; a tab reading 0 is a tab
 * you have already been told not to press.
 */
function PageTabs({
  tabs = [],
  active,
  onSelect,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(null);
  return /*#__PURE__*/React.createElement("nav", _extends({}, rest, {
    "aria-label": "Sections",
    style: {
      display: "flex",
      gap: 4,
      overflowX: "auto",
      borderBottom: "1px solid var(--gh-ink-10)",
      marginBottom: -1,
      scrollbarWidth: "none",
      ...style
    }
  }), tabs.map(t => {
    const on = t.key === active;
    const hot = hover === t.key;
    return /*#__PURE__*/React.createElement("a", {
      key: t.key,
      href: t.href || "#",
      "aria-current": on ? "page" : undefined,
      onMouseEnter: () => setHover(t.key),
      onMouseLeave: () => setHover(null),
      onClick: e => {
        if (onSelect) {
          e.preventDefault();
          onSelect(t.key);
        }
      },
      style: {
        whiteSpace: "nowrap",
        padding: "10px 12px",
        fontSize: "var(--text-sm)",
        textDecoration: "none",
        borderBottom: "2px solid " + (on ? "var(--gh-teal)" : hot ? "var(--gh-ink-20)" : "transparent"),
        fontWeight: on ? "var(--weight-medium)" : 400,
        color: on || hot ? "var(--gh-ink)" : "var(--gh-ink-60)",
        transition: "border-color var(--dur-control) var(--ease-out), color var(--dur-control) var(--ease-out)"
      }
    }, t.label, typeof t.count === "number" && t.count > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 6,
        fontSize: "var(--text-xs)",
        color: on ? "var(--gh-ink-55)" : "var(--gh-ink-40)"
      }
    }, t.count));
  }));
}
Object.assign(__ds_scope, { PageTabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/PageTabs.jsx", error: String((e && e.message) || e) }); }

// components/navigation/PrimaryNav.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Verb-based desktop nav. "Find work · Deliver work · Get paid" is the
 * creative's whole relationship with this product, in order.
 *
 * Deliberately three: a header that lists everything is a dropdown with extra
 * steps. Hidden below md — the bottom tab bar owns mobile, and two nav shells
 * on one screen is how you get two answers to "where am I".
 */
const CLIENT_NAV = [{
  href: "/browse",
  label: "Find someone"
}, {
  href: "/dashboard/jobs",
  label: "Manage work"
}, {
  href: "/dashboard/payments",
  label: "Finances"
}];
const CREATIVE_NAV = [{
  href: "/jobs",
  label: "Find work"
}, {
  href: "/dashboard/jobs",
  label: "Deliver work"
}, {
  href: "/dashboard/payments",
  label: "Get paid"
}];
function PrimaryNav({
  items = CREATIVE_NAV,
  active,
  onNavigate,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(null);
  return /*#__PURE__*/React.createElement("nav", _extends({}, rest, {
    "aria-label": "Primary",
    style: {
      display: "flex",
      alignItems: "center",
      gap: 4,
      ...style
    }
  }), items.map(d => {
    const on = active === d.href;
    const hot = hover === d.href;
    return /*#__PURE__*/React.createElement("a", {
      key: d.href,
      href: d.href,
      "aria-current": on ? "page" : undefined,
      onMouseEnter: () => setHover(d.href),
      onMouseLeave: () => setHover(null),
      onClick: e => {
        if (onNavigate) {
          e.preventDefault();
          onNavigate(d.href);
        }
      },
      style: {
        borderRadius: "var(--radius-panel)",
        padding: "6px 12px",
        fontSize: "var(--text-sm)",
        textDecoration: "none",
        background: on ? "var(--gh-ink-06)" : hot ? "rgba(26,22,17,0.04)" : "transparent",
        fontWeight: on ? "var(--weight-medium)" : 400,
        color: on || hot ? "var(--gh-ink)" : "var(--gh-ink-70)",
        transition: "background-color var(--dur-control) var(--ease-out), color var(--dur-control) var(--ease-out)"
      }
    }, d.label);
  }));
}
Object.assign(__ds_scope, { CLIENT_NAV, CREATIVE_NAV, PrimaryNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/PrimaryNav.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SearchScope.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * The search scope selector. Two surfaces search two different things, and
 * nothing said so: someone typing "logo" into /jobs is looking for work,
 * someone typing it into /browse is looking for a person. Get it the wrong way
 * round and the honest result is zero, which reads as "this platform has
 * nothing" rather than "you are on the wrong page".
 *
 * A sentence on each, not two bare tabs — "Creatives" and "Jobs" mean nothing
 * on a first visit. The sentence IS the feature.
 */
const OPTIONS = [{
  key: "creatives",
  href: "/browse",
  label: "Find someone to hire",
  sentence: "Search people — their work, prices and reviews."
}, {
  key: "jobs",
  href: "/jobs",
  label: "Find work to do",
  sentence: "Search jobs clients have posted, with budgets."
}];
function SearchScope({
  current = "creatives",
  onSelect,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(null);
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    role: "group",
    "aria-label": "What are you searching for?",
    style: {
      display: "grid",
      gap: 8,
      gridTemplateColumns: "repeat(2, minmax(0,1fr))",
      ...style
    }
  }), OPTIONS.map(o => {
    const on = o.key === current;
    const hot = hover === o.key;
    return /*#__PURE__*/React.createElement("a", {
      key: o.key,
      href: o.href,
      "aria-current": on ? "page" : undefined,
      onMouseEnter: () => setHover(o.key),
      onMouseLeave: () => setHover(null),
      onClick: e => {
        if (onSelect) {
          e.preventDefault();
          onSelect(o.key);
        }
      },
      style: {
        borderRadius: "var(--radius-panel)",
        padding: "12px 16px",
        textDecoration: "none",
        border: "1px solid " + (on ? "var(--gh-teal)" : hot ? "var(--gh-ink-30)" : "var(--gh-ink-15)"),
        background: on ? "var(--gh-teal-06)" : "var(--surface-card)",
        transition: "border-color var(--dur-control) var(--ease-out), background-color var(--dur-control) var(--ease-out)"
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: "var(--text-sm)",
        fontWeight: "var(--weight-semibold)",
        color: on ? "var(--gh-teal-dark)" : "var(--gh-ink)"
      }
    }, o.label), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: "2px 0 0",
        fontSize: "var(--text-xs)",
        color: "var(--gh-ink-60)"
      }
    }, o.sentence));
  }));
}
Object.assign(__ds_scope, { SearchScope });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SearchScope.jsx", error: String((e && e.message) || e) }); }

// components/navigation/StickyActionBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Mobile-only action bar pinned to the bottom of the viewport. On a phone the
 * primary action scrolls away within one swipe, and both the job detail and the
 * profile page are long. Desktop keeps its in-page buttons.
 *
 * A LINK, not a second copy of the form. Whatever the real action is (fund
 * escrow, release, message) already exists exactly once further up the page;
 * the bar carries the label and the amount and takes you to it. Two live submit
 * buttons for one payment is how double-charges happen.
 */
function StickyActionBar({
  label,
  hint,
  href = "#",
  onClick,
  position = "fixed",
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      position,
      insetInline: 0,
      bottom: 0,
      zIndex: 40,
      borderTop: "1px solid var(--gh-ink-10)",
      background: "var(--surface-bar)",
      backdropFilter: "blur(8px)",
      boxShadow: "var(--elev-2)",
      ...style
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 16px",
      paddingBottom: "max(12px, env(safe-area-inset-bottom))"
    }
  }, hint && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      minWidth: 0,
      flex: 1,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      fontSize: "var(--text-xs)",
      color: "var(--gh-ink-60)"
    }
  }, hint), /*#__PURE__*/React.createElement("a", {
    href: href,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      flex: hint ? undefined : 1,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 44,
      borderRadius: "var(--radius-control)",
      background: hover ? "var(--gh-teal-dark)" : "var(--gh-teal)",
      padding: "10px 20px",
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-medium)",
      color: "#fff",
      textDecoration: "none",
      transition: "background-color var(--dur-control) var(--ease-out)"
    }
  }, label)));
}
Object.assign(__ds_scope, { StickyActionBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/StickyActionBar.jsx", error: String((e && e.message) || e) }); }

// components/trust/EmptyState.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Two weights on purpose. `prompt`: a whole surface with nothing in it, so it
 * gets a panel, the "nothing yet" stamp and a real way out. `quiet`: one empty
 * region on a page that is otherwise full — a line of text and at most a link,
 * never the stamp.
 *
 * The stamp here is its own artwork (`nothing-yet`). The five money stamps are
 * never borrowed for an empty state: they name stages of a job's money, and
 * nothing has happened here yet.
 */
function EmptyState({
  title,
  body,
  actionLabel,
  actionHref = "#",
  tone = "prompt",
  style,
  ...rest
}) {
  if (tone === "quiet") {
    return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
      style: {
        padding: "32px 24px",
        textAlign: "center",
        ...style
      }
    }), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: "var(--text-sm)",
        color: "var(--gh-ink-60)"
      }
    }, title), body && /*#__PURE__*/React.createElement("p", {
      style: {
        margin: "4px 0 0",
        fontSize: "var(--text-xs)",
        color: "var(--gh-ink-45)"
      }
    }, body), actionLabel && /*#__PURE__*/React.createElement("a", {
      href: actionHref,
      style: {
        display: "inline-block",
        marginTop: 8,
        fontSize: "var(--text-xs)",
        fontWeight: "var(--weight-medium)",
        color: "var(--gh-teal-dark)"
      }
    }, actionLabel));
  }
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      borderRadius: "var(--radius-card)",
      border: "2px dashed var(--surface-accent-edge)",
      background: "var(--surface-accent)",
      padding: "48px 24px 56px",
      ...style
    }
  }), /*#__PURE__*/React.createElement("img", {
    src: __ds_scope.stampUrl("nothing-yet"),
    alt: "",
    width: 112,
    height: 112,
    loading: "lazy",
    decoding: "async",
    style: {
      display: "block",
      width: 112,
      height: 112,
      marginBottom: 12,
      userSelect: "none"
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-base)",
      fontWeight: "var(--weight-semibold)",
      color: "var(--gh-ink)"
    }
  }, title), body && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "4px 0 0",
      maxWidth: 384,
      fontSize: "var(--text-sm)",
      color: "var(--gh-ink-60)",
      textWrap: "pretty"
    }
  }, body), actionLabel && /*#__PURE__*/React.createElement("a", {
    href: actionHref,
    style: {
      marginTop: 20
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "outline"
  }, actionLabel)));
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/trust/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/trust/SaveButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** The ♡ on cards. Optimistic: it fills the instant you tap it, then pops. */
function SaveButton({
  saved = false,
  onToggle,
  style,
  ...rest
}) {
  const [on, setOn] = React.useState(saved);
  const [bump, setBump] = React.useState(0);
  const [hover, setHover] = React.useState(false);
  React.useEffect(() => {
    if (!bump) return;
    const t = setTimeout(() => setBump(0), 350);
    return () => clearTimeout(t);
  }, [bump]);
  return /*#__PURE__*/React.createElement("button", _extends({}, rest, {
    type: "button",
    "aria-label": on ? "Unsave" : "Save",
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    onClick: e => {
      e.stopPropagation();
      setOn(!on);
      setBump(bump + 1);
      onToggle && onToggle(!on);
    },
    style: {
      display: "inline-flex",
      height: 32,
      width: 32,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "var(--radius-pill)",
      cursor: "pointer",
      border: "1px solid " + (on ? "var(--gh-teal)" : hover ? "var(--gh-teal)" : "var(--border-control)"),
      background: on ? "var(--gh-teal)" : "var(--gh-white)",
      color: on ? "#fff" : hover ? "var(--gh-teal)" : "#737373",
      fontSize: "var(--text-sm)",
      lineHeight: 1,
      transition: "all var(--dur-control) var(--ease-out)",
      ...style
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      transform: bump ? "scale(var(--pop-scale))" : "scale(1)",
      transition: "transform 350ms var(--ease-out)"
    }
  }, on ? "\u2665" : "\u2661"));
}
Object.assign(__ds_scope, { SaveButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/trust/SaveButton.jsx", error: String((e && e.message) || e) }); }

// components/listings/JobCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const formatMwk = n => n == null ? "\u2014" : "MWK " + n.toLocaleString("en-GB");
const initialsOf = name => (name || "Client").split(" ").map(n => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

/**
 * A job, as a card. Title in Inter at 600, the client's trust signals, then
 * the budget in the reserved green, then two lines of brief.
 *
 * The teal left edge wipes in on hover (scale-x from the left, 200ms) — the
 * card's only decoration.
 */
function JobCard({
  title,
  category,
  postedAgo = "just now",
  clientName = "a client",
  brief = "No description provided.",
  budgetMwk = null,
  trustBits = [],
  proposalsCount = 0,
  showSave = false,
  saved = false,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [seeHover, setSeeHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: "relative",
      overflow: "hidden",
      borderRadius: "var(--radius-card)",
      border: "var(--elev-1-border)",
      background: "var(--surface-card)",
      boxShadow: hover ? "var(--shadow-listing-hover)" : "var(--shadow-listing)",
      transform: hover ? "translateY(var(--hover-lift))" : "none",
      transition: "all var(--dur-card) var(--ease-out)",
      ...style
    }
  }), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      width: 4,
      transformOrigin: "left",
      transform: hover ? "scaleX(1)" : "scaleX(0)",
      background: "var(--gh-teal)",
      transition: "transform var(--dur-panel) var(--ease-out)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 20
    }
  }, showSave && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      right: 16,
      top: 16,
      display: "flex",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.SaveButton, {
    saved: saved
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      paddingRight: 40,
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-xl)",
      fontWeight: "var(--weight-semibold)",
      lineHeight: "var(--leading-tight)",
      color: "var(--gh-ink)",
      overflowWrap: "break-word"
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 8,
      fontSize: "var(--text-xs)",
      color: "var(--gh-ink-55)"
    }
  }, /*#__PURE__*/React.createElement("span", null, postedAgo), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true
  }, "\xB7"), /*#__PURE__*/React.createElement("span", {
    style: {
      borderRadius: "var(--radius-pill)",
      background: "rgba(218,207,178,0.70)",
      padding: "2px 10px",
      fontWeight: "var(--weight-medium)",
      color: "var(--gh-ink-75)"
    }
  }, category)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      height: 28,
      width: 28,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "var(--radius-pill)",
      background: "var(--gh-ink-85)",
      fontSize: "var(--text-10)",
      fontWeight: "var(--weight-semibold)",
      color: "var(--gh-ground)"
    }
  }, initialsOf(clientName)), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-xs)",
      color: "var(--gh-ink-65)"
    }
  }, "Posted by ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: "var(--weight-medium)",
      color: "var(--gh-ink-80)"
    }
  }, clientName))), trustBits.length > 0 && /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: "8px 0 0",
      padding: 0,
      listStyle: "none",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: "4px 8px",
      fontSize: "var(--text-11)",
      color: "var(--gh-ink-60)"
    }
  }, trustBits.map((b, i) => /*#__PURE__*/React.createElement("li", {
    key: b,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, i > 0 && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      color: "var(--gh-ink-25)"
    }
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, b)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      borderRadius: "var(--radius-panel)",
      background: "var(--gh-mark-10)",
      padding: "6px 12px",
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-semibold)",
      color: "var(--gh-mark)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "HandCoins",
    size: 16
  }), /*#__PURE__*/React.createElement("span", null, "Budget: ", budgetMwk != null ? formatMwk(budgetMwk) : "Open")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16
    },
    onMouseEnter: () => setSeeHover(true),
    onMouseLeave: () => setSeeHover(false)
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
      overflowWrap: "anywhere",
      fontSize: "var(--text-sm)",
      lineHeight: "var(--leading-relaxed)",
      color: "var(--gh-ink-75)"
    }
  }, brief), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "6px 0 0",
      fontSize: "var(--text-xs)",
      fontWeight: "var(--weight-medium)",
      color: "var(--gh-teal-dark)",
      textDecoration: seeHover ? "underline" : "none",
      textUnderlineOffset: 4
    }
  }, "More info")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20,
      paddingTop: 16,
      borderTop: "1px solid var(--gh-ink-10)",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      borderRadius: "var(--radius-pill)",
      background: "var(--gh-ink-05)",
      padding: "2px 10px",
      fontSize: "var(--text-10)",
      fontWeight: "var(--weight-medium)",
      color: "var(--gh-ink-70)"
    }
  }, category), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      color: "var(--gh-ink-60)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: "var(--weight-semibold)",
      color: "var(--gh-ink-80)"
    }
  }, proposalsCount), " ", proposalsCount === 1 ? "proposal" : "proposals"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      borderRadius: "var(--radius-control)",
      background: "var(--gh-ink)",
      padding: "6px 12px",
      fontSize: "var(--text-xs)",
      fontWeight: "var(--weight-medium)",
      color: "var(--gh-ground)",
      textDecoration: "none",
      transition: "background-color var(--dur-control) var(--ease-out)"
    },
    onMouseEnter: e => e.currentTarget.style.background = "var(--gh-teal)",
    onMouseLeave: e => e.currentTarget.style.background = "var(--gh-ink)"
  }, "See more")))));
}
Object.assign(__ds_scope, { JobCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/listings/JobCard.jsx", error: String((e && e.message) || e) }); }

// components/trust/StarRatingInput.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const PATH = "M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

/** Interactive rating. Hover previews, click commits, hidden input submits. */
function StarRatingInput({
  name,
  defaultValue = 0,
  onChange,
  style,
  ...rest
}) {
  const [value, setValue] = React.useState(defaultValue);
  const [hover, setHover] = React.useState(0);
  const active = hover || value;
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    onMouseLeave: () => setHover(0),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 4,
      ...style
    }
  }), /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: name,
    value: value
  }), [1, 2, 3, 4, 5].map(n => {
    const on = n <= active;
    return /*#__PURE__*/React.createElement("button", {
      key: n,
      type: "button",
      "aria-label": n + (n === 1 ? " star" : " stars"),
      onClick: () => {
        setValue(n);
        onChange && onChange(n);
      },
      onMouseEnter: () => setHover(n),
      style: {
        padding: 2,
        border: 0,
        background: "none",
        cursor: "pointer",
        transition: "transform var(--dur-control) var(--ease-out)",
        transform: hover === n ? "scale(1.1)" : "none"
      }
    }, /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 24 24",
      width: 28,
      height: 28,
      fill: on ? "var(--status-star)" : "none",
      stroke: on ? "var(--status-star)" : "var(--gh-ink-25)",
      strokeWidth: "1.5",
      style: {
        display: "block",
        outline: "none"
      }
    }, /*#__PURE__*/React.createElement("path", {
      d: PATH
    })));
  }));
}
Object.assign(__ds_scope, { StarRatingInput });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/trust/StarRatingInput.jsx", error: String((e && e.message) || e) }); }

// components/trust/Stars.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const PATH = "M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

/** Five stars, amber-400 filled to the rounded value. Read-only. */
function Stars({
  value = 0,
  size = 16,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({}, rest, {
    "aria-label": value.toFixed(1) + " out of 5",
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 2,
      ...style
    }
  }), [1, 2, 3, 4, 5].map(n => {
    const on = n <= Math.round(value);
    return /*#__PURE__*/React.createElement("svg", {
      key: n,
      viewBox: "0 0 24 24",
      width: size,
      height: size,
      fill: on ? "var(--status-star)" : "none",
      stroke: on ? "var(--status-star)" : "var(--gh-ink-25)",
      strokeWidth: "1.5",
      style: {
        display: "block",
        outline: "none"
      }
    }, /*#__PURE__*/React.createElement("path", {
      d: PATH
    }));
  }));
}
Object.assign(__ds_scope, { Stars });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/trust/Stars.jsx", error: String((e && e.message) || e) }); }

// components/listings/CreativeCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const formatMwk = n => n == null ? "\u2014" : "MWK " + n.toLocaleString("en-GB");
const initialsOf = name => (name || "G H").split(" ").map(n => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
const AVATAR_FALLBACK = "radial-gradient(120% 80% at 30% 30%, #069494 0%, #046B6B 55%, #023939 100%)";
const DOT = {
  available: "var(--status-available)",
  busy: "var(--status-busy)",
  away: "var(--status-away)"
};

/**
 * A person, as a card. 4:3 cover, then the identity row, then one line of
 * headline, skills, and a rating/price footer above a hairline.
 *
 * No avatar image: a teal radial gradient with the initials in Instrument
 * Serif. Never a grey placeholder silhouette.
 */
function CreativeCard({
  name,
  location = "Malawi",
  headline = "Available for work.",
  category,
  avatarUrl = null,
  skills = [],
  availability = "available",
  rating = null,
  reviewCount = 0,
  fromPriceMwk = null,
  showSave = false,
  saved = false,
  verifiedAt = null,
  style,
  ...rest
}) {
  // verifiedAt is accepted and ignored: the shipped card carries no
  // VerifiedBadge, and letting it fall into ...rest emits it as a DOM attribute.
  const [hover, setHover] = React.useState(false);
  const initials = initialsOf(name);
  const top = skills.slice(0, 3);
  const more = skills.length - top.length;
  const priceLabel = fromPriceMwk != null ? "From " + formatMwk(fromPriceMwk) : "Custom pricing";
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: "relative",
      display: "flex",
      height: "100%",
      flexDirection: "column",
      overflow: "hidden",
      borderRadius: "var(--radius-card)",
      border: "var(--elev-1-border)",
      background: "var(--surface-card)",
      boxShadow: hover ? "var(--shadow-listing-hover)" : "var(--shadow-listing)",
      transform: hover ? "translateY(var(--hover-lift))" : "none",
      transition: "all var(--dur-card) var(--ease-out)",
      ...style
    }
  }), showSave && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      right: 12,
      top: 12,
      zIndex: 10
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.SaveButton, {
    saved: saved
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      aspectRatio: "4 / 3",
      width: "100%",
      overflow: "hidden"
    }
  }, avatarUrl ? /*#__PURE__*/React.createElement("img", {
    className: "gh-mounted",
    src: avatarUrl,
    alt: name,
    style: {
      height: "100%",
      width: "100%",
      objectFit: "cover",
      display: "block",
      transform: hover ? "scale(1.03)" : "scale(1)",
      transition: "transform var(--dur-image) var(--ease-out)"
    }
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      height: "100%",
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      background: AVATAR_FALLBACK
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-5xl)",
      fontWeight: 600,
      letterSpacing: "-0.02em",
      color: "var(--gh-ground)"
    }
  }, initials)), category && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      bottom: 12,
      left: 12,
      borderRadius: "var(--radius-pill)",
      background: "rgba(247,246,243,0.94)",
      backdropFilter: "blur(4px)",
      padding: "4px 12px",
      fontSize: "var(--text-11)",
      fontWeight: "var(--weight-medium)",
      color: "var(--gh-ink)",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
    }
  }, category)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flex: 1,
      flexDirection: "column",
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      height: 36,
      width: 36,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "var(--radius-pill)",
      background: "var(--gh-ink-85)",
      fontSize: "var(--text-11)",
      fontWeight: "var(--weight-semibold)",
      color: "var(--gh-ground)"
    }
  }, initials), /*#__PURE__*/React.createElement("span", {
    title: availability,
    style: {
      position: "absolute",
      bottom: -2,
      right: -2,
      height: 12,
      width: 12,
      borderRadius: "var(--radius-pill)",
      background: DOT[availability] || DOT.away,
      boxShadow: "0 0 0 2px var(--surface-card)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-semibold)",
      color: "var(--gh-ink)"
    }
  }, name), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      fontSize: "var(--text-11)",
      color: "var(--gh-ink-55)"
    }
  }, location))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "12px 0 0",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      fontSize: "var(--text-sm)",
      color: "var(--gh-ink-80)"
    }
  }, headline), top.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 6,
      marginTop: 12
    }
  }, top.map(s => /*#__PURE__*/React.createElement("span", {
    key: s,
    style: {
      borderRadius: "var(--radius-pill)",
      background: "var(--gh-ink-05)",
      padding: "2px 10px",
      fontSize: "var(--text-10)",
      fontWeight: "var(--weight-medium)",
      color: "var(--gh-ink-70)"
    }
  }, s)), more > 0 && /*#__PURE__*/React.createElement("span", {
    title: skills.slice(3).join(", "),
    style: {
      borderRadius: "var(--radius-pill)",
      padding: "2px 6px",
      fontSize: "var(--text-10)",
      fontWeight: "var(--weight-medium)",
      color: "var(--gh-ink-45)"
    }
  }, "+", more)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "auto",
      paddingTop: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      borderTop: "1px solid var(--gh-ink-10)",
      marginBlockStart: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 4,
      fontSize: "var(--text-xs)",
      color: "var(--gh-ink-60)"
    }
  }, reviewCount > 0 && rating != null ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(__ds_scope.Stars, {
    value: rating,
    size: 14
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: "var(--weight-medium)",
      color: "var(--gh-ink-80)"
    }
  }, rating.toFixed(1)), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--gh-ink-40)"
    }
  }, "\xB7 ", reviewCount, " review", reviewCount === 1 ? "" : "s")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(__ds_scope.Stars, {
    value: 0,
    size: 14
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: "var(--weight-medium)",
      color: "var(--gh-ink-70)"
    }
  }, "New"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--gh-ink-40)"
    }
  }, "\xB7 no reviews yet"))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-semibold)",
      color: "var(--gh-ink)",
      whiteSpace: "nowrap"
    }
  }, priceLabel))));
}
Object.assign(__ds_scope, { CreativeCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/listings/CreativeCard.jsx", error: String((e && e.message) || e) }); }

// components/listings/ServiceCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const formatMwk = n => n == null ? "\u2014" : "MWK " + n.toLocaleString("en-GB");

/**
 * A rate-card line item on a creative's profile. Paper, not white — it sits
 * inside a white card, so it recesses instead of stacking.
 *
 * "From" leads because price is the low end of a span, not the price. The
 * rating is the CREATIVE'S and is labelled as such: there is no per-service
 * rating in the schema, and a per-service 4.8 nobody earned is worse than no
 * number at all.
 */
function ServiceCard({
  title,
  description,
  priceMwk = null,
  priceMaxMwk = null,
  deliveryDays = null,
  coverUrl = null,
  rating = null,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      borderRadius: "var(--radius-panel)",
      border: "1px solid var(--border-inset)",
      background: "var(--surface-inset)",
      ...style
    }
  }), coverUrl && /*#__PURE__*/React.createElement("img", {
    className: "gh-mounted",
    src: coverUrl,
    alt: "",
    loading: "lazy",
    style: {
      height: 128,
      width: "100%",
      objectFit: "cover",
      display: "block"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flex: 1,
      flexDirection: "column",
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontWeight: "var(--weight-medium)",
      color: "var(--gh-ink)"
    }
  }, title), description && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "4px 0 0",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
      fontSize: "var(--text-xs)",
      color: "var(--gh-ink-65)"
    }
  }, description), rating && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "8px 0 0",
      display: "flex",
      alignItems: "center",
      gap: 4,
      fontSize: "var(--text-xs)",
      color: "var(--gh-ink-55)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Stars, {
    value: rating.avg,
    size: 14
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: "var(--weight-medium)",
      color: "var(--gh-ink-80)"
    }
  }, rating.avg.toFixed(1)), /*#__PURE__*/React.createElement("span", null, "across ", rating.count, " review", rating.count === 1 ? "" : "s", " of this creative")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "12px 0 0",
      fontSize: "var(--text-sm)"
    }
  }, priceMwk != null ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--gh-ink-55)"
    }
  }, "From "), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: "var(--weight-semibold)",
      color: "var(--gh-ink)"
    }
  }, formatMwk(priceMwk)), priceMaxMwk && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--gh-ink-65)"
    }
  }, " \u2013 ", formatMwk(priceMaxMwk))) : /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--gh-ink-65)"
    }
  }, "Price on request"), deliveryDays && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--gh-ink-55)"
    }
  }, " \xB7 ~", deliveryDays, "d"))));
}
Object.assign(__ds_scope, { ServiceCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/listings/ServiceCard.jsx", error: String((e && e.message) || e) }); }

// components/trust/StyleSwatch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Style filters as pictures, not words. Many clients here have never
 * commissioned design and do not have the vocabulary — "flat vector" means
 * nothing, a picture of it means everything.
 *
 * Every swatch is inline SVG: no image files, nothing to load and nothing to
 * licence. On a Malawian mobile connection six images at the top of a filter
 * panel would be the slowest thing on the page. These are the shipped
 * drawings, copied verbatim from components/style-swatch.tsx — do not redraw.
 */
const STYLES = [{
  slug: "flat",
  label: "Flat & simple",
  hint: "Clean shapes, few colours"
}, {
  slug: "3d",
  label: "3D & shiny",
  hint: "Depth, shadow, gloss"
}, {
  slug: "hand-drawn",
  label: "Hand-drawn",
  hint: "Sketched, illustrated by hand"
}, {
  slug: "vintage",
  label: "Vintage",
  hint: "Old-style, worn, retro"
}, {
  slug: "photographic",
  label: "Photographic",
  hint: "Built around real photos"
}, {
  slug: "bold-type",
  label: "Big bold type",
  hint: "Words are the design"
}];
function StyleSwatch({
  slug,
  style,
  ...rest
}) {
  const box = {
    height: "100%",
    width: "100%",
    display: "block",
    outline: "none",
    ...style
  };
  switch (slug) {
    case "flat":
      return /*#__PURE__*/React.createElement("svg", _extends({
        viewBox: "0 0 64 64",
        style: box
      }, rest, {
        "aria-hidden": true
      }), /*#__PURE__*/React.createElement("rect", {
        width: "64",
        height: "64",
        fill: "#F3EFE6"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "26",
        cy: "26",
        r: "14",
        fill: "#069494"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "28",
        y: "30",
        width: "24",
        height: "24",
        rx: "3",
        fill: "#2F5D3B"
      }));
    case "3d":
      return /*#__PURE__*/React.createElement("svg", _extends({
        viewBox: "0 0 64 64",
        style: box
      }, rest, {
        "aria-hidden": true
      }), /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("radialGradient", {
        id: "gh-sw3d",
        cx: "35%",
        cy: "30%"
      }, /*#__PURE__*/React.createElement("stop", {
        offset: "0%",
        stopColor: "#8FE3E3"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "55%",
        stopColor: "#069494"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "100%",
        stopColor: "#045757"
      }))), /*#__PURE__*/React.createElement("rect", {
        width: "64",
        height: "64",
        fill: "#EDE7DA"
      }), /*#__PURE__*/React.createElement("ellipse", {
        cx: "34",
        cy: "52",
        rx: "16",
        ry: "4",
        fill: "#1A1611",
        opacity: "0.18"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "32",
        cy: "30",
        r: "18",
        fill: "url(#gh-sw3d)"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "25",
        cy: "23",
        r: "5",
        fill: "#fff",
        opacity: "0.55"
      }));
    case "hand-drawn":
      return /*#__PURE__*/React.createElement("svg", _extends({
        viewBox: "0 0 64 64",
        style: box
      }, rest, {
        "aria-hidden": true
      }), /*#__PURE__*/React.createElement("rect", {
        width: "64",
        height: "64",
        fill: "#FAF7F0"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M12 44c6-14 10-22 16-22s6 14 12 14 8-8 12-14",
        fill: "none",
        stroke: "#1A1611",
        strokeWidth: "2.5",
        strokeLinecap: "round"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M14 50c10-3 24-4 36-2",
        fill: "none",
        stroke: "#1A1611",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        opacity: "0.5"
      }));
    case "vintage":
      return /*#__PURE__*/React.createElement("svg", _extends({
        viewBox: "0 0 64 64",
        style: box
      }, rest, {
        "aria-hidden": true
      }), /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("pattern", {
        id: "gh-swGrain",
        width: "4",
        height: "4",
        patternUnits: "userSpaceOnUse"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M0 0h1v1H0zM2 2h1v1H2z",
        fill: "#5C4426"
      }))), /*#__PURE__*/React.createElement("rect", {
        width: "64",
        height: "64",
        fill: "#DACFB2"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "32",
        cy: "32",
        r: "19",
        fill: "none",
        stroke: "#8A6B3D",
        strokeWidth: "2"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "32",
        cy: "32",
        r: "13",
        fill: "#B8894F"
      }), /*#__PURE__*/React.createElement("rect", {
        width: "64",
        height: "64",
        fill: "url(#gh-swGrain)",
        opacity: "0.25"
      }));
    case "photographic":
      return /*#__PURE__*/React.createElement("svg", _extends({
        viewBox: "0 0 64 64",
        style: box
      }, rest, {
        "aria-hidden": true
      }), /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
        id: "gh-swSky",
        x1: "0",
        y1: "0",
        x2: "0",
        y2: "1"
      }, /*#__PURE__*/React.createElement("stop", {
        offset: "0%",
        stopColor: "#F6C177"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "100%",
        stopColor: "#E0857B"
      }))), /*#__PURE__*/React.createElement("rect", {
        width: "64",
        height: "64",
        fill: "url(#gh-swSky)"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "42",
        cy: "24",
        r: "8",
        fill: "#FFF3D6"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M0 46l18-14 14 11 12-8 20 15v10H0z",
        fill: "#2F5D3B"
      }));
    case "bold-type":
      return /*#__PURE__*/React.createElement("svg", _extends({
        viewBox: "0 0 64 64",
        style: box
      }, rest, {
        "aria-hidden": true
      }), /*#__PURE__*/React.createElement("rect", {
        width: "64",
        height: "64",
        fill: "#1A1611"
      }), /*#__PURE__*/React.createElement("text", {
        x: "32",
        y: "46",
        textAnchor: "middle",
        fontSize: "42",
        fontWeight: "800",
        fill: "#F3EFE6",
        fontFamily: "Arial Black, Helvetica, sans-serif"
      }, "Aa"));
    default:
      return /*#__PURE__*/React.createElement("div", {
        style: {
          ...box,
          background: "var(--gh-ink-10)"
        },
        "aria-hidden": true
      });
  }
}

/** The picker. Same markup on the creative's profile and the client's filters. */
function StyleChoices({
  name,
  selected = [],
  style,
  ...rest
}) {
  const [chosen, setChosen] = React.useState(selected);
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(6, minmax(0,1fr))",
      gap: 12,
      ...style
    }
  }), STYLES.map(s => {
    const on = chosen.indexOf(s.slug) > -1;
    return /*#__PURE__*/React.createElement("label", {
      key: s.slug,
      title: s.hint,
      style: {
        cursor: "pointer",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      name: name,
      value: s.slug,
      checked: on,
      onChange: () => setChosen(on ? chosen.filter(c => c !== s.slug) : chosen.concat([s.slug])),
      style: {
        position: "absolute",
        width: 1,
        height: 1,
        opacity: 0,
        pointerEvents: "none"
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "block",
        overflow: "hidden",
        borderRadius: "var(--radius-panel)",
        border: "2px solid " + (on ? "var(--gh-teal)" : "transparent"),
        transition: "border-color var(--dur-control) var(--ease-out)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "block",
        aspectRatio: "1 / 1"
      }
    }, /*#__PURE__*/React.createElement(StyleSwatch, {
      slug: s.slug
    }))), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "block",
        marginTop: 6,
        fontSize: "var(--text-11)",
        lineHeight: "var(--leading-tight)",
        fontWeight: on ? "var(--weight-semibold)" : 400,
        color: on ? "var(--gh-ink)" : "var(--gh-ink-65)"
      }
    }, s.label));
  }));
}
Object.assign(__ds_scope, { STYLES, StyleSwatch, StyleChoices });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/trust/StyleSwatch.jsx", error: String((e && e.message) || e) }); }

// components/trust/TagInput.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Chip input: type, Enter or comma commits, Backspace on empty removes the last. */
function TagInput({
  name,
  defaultValue = [],
  placeholder,
  style,
  ...rest
}) {
  const [tags, setTags] = React.useState(defaultValue);
  const [draft, setDraft] = React.useState("");
  const [focus, setFocus] = React.useState(false);
  function add(input) {
    const v = String(input).trim().replace(/,+$/, "").trim();
    if (!v) return;
    if (tags.some(t => t.toLowerCase() === v.toLowerCase())) {
      setDraft("");
      return;
    }
    setTags(tags.concat([v]));
    setDraft("");
  }
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: style
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 8,
      borderRadius: "var(--radius-control)",
      border: "1px solid var(--border-control)",
      background: "var(--gh-white)",
      padding: 6,
      outline: focus ? "2px solid var(--focus-ring)" : "none"
    }
  }, tags.map((t, i) => /*#__PURE__*/React.createElement("span", {
    key: t,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      borderRadius: "var(--radius-pill)",
      border: "1px solid var(--gh-teal)",
      background: "var(--gh-teal)",
      padding: "4px 12px",
      fontSize: "var(--text-xs)",
      fontWeight: "var(--weight-medium)",
      color: "var(--gh-ground)"
    }
  }, t, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setTags(tags.filter((_, idx) => idx !== i)),
    "aria-label": "Remove " + t,
    style: {
      border: 0,
      background: "none",
      padding: 0,
      cursor: "pointer",
      lineHeight: 1,
      color: "rgba(239,230,206,0.8)"
    }
  }, "\xD7"))), /*#__PURE__*/React.createElement("input", {
    value: draft,
    onChange: e => setDraft(e.target.value),
    onFocus: () => setFocus(true),
    onBlur: () => {
      setFocus(false);
      add(draft);
    },
    onKeyDown: e => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        add(draft);
      } else if (e.key === "Backspace" && !draft && tags.length) {
        setTags(tags.slice(0, -1));
      }
    },
    placeholder: tags.length ? "" : placeholder,
    style: {
      minWidth: "8rem",
      flex: 1,
      background: "transparent",
      border: 0,
      padding: "4px",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-sm)",
      color: "var(--gh-ink)",
      outline: "none"
    }
  })), tags.map(t => /*#__PURE__*/React.createElement("input", {
    key: "h-" + t,
    type: "hidden",
    name: name,
    value: t
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "4px 0 0",
      fontSize: "var(--text-11)",
      color: "#737373"
    }
  }, "Type and press Enter to add each one."));
}
Object.assign(__ds_scope, { TagInput });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/trust/TagInput.jsx", error: String((e && e.message) || e) }); }

// components/trust/VerifiedBadge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * "Checked by Ganyu Hub" — a claim about our process, not a guarantee about
 * anyone's future conduct. Renders NOTHING when unverified: a grey badge on
 * every new creative turns an absence into an accusation.
 */
function VerifiedBadge({
  verifiedAt,
  size = "sm",
  style,
  ...rest
}) {
  if (!verifiedAt) return null;
  const lg = size === "lg";
  return /*#__PURE__*/React.createElement("span", _extends({}, rest, {
    title: "A person at Ganyu Hub has checked this creative's identity and work.",
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      borderRadius: "var(--radius-pill)",
      background: "var(--gh-mark-10)",
      color: "var(--gh-mark)",
      fontWeight: "var(--weight-medium)",
      padding: lg ? "4px 10px" : "2px 8px",
      fontSize: lg ? "var(--text-xs)" : "var(--text-11)",
      whiteSpace: "nowrap",
      ...style
    }
  }), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "BadgeCheck",
    size: lg ? 16 : 14
  }), "Checked by Ganyu Hub");
}
Object.assign(__ds_scope, { VerifiedBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/trust/VerifiedBadge.jsx", error: String((e && e.message) || e) }); }

// ui_kits/data.js
try { (() => {
/* Illustrative content for both UI kits. Copy tone matches the product:
   plain, second person, no exclamation marks, no emoji outside the hero badge. */
window.GH_DATA = {
  categories: ["Design", "Web & Software", "Video & Photography", "Animation & Motion", "Writing & Translation", "Music & Audio", "Crafts & Handmade", "Marketing"],
  creatives: [{
    name: "Thandiwe Banda",
    location: "Blantyre",
    category: "Design",
    headline: "Brand identity and packaging for Malawian food businesses.",
    skills: ["Logo design", "Packaging", "Illustration", "Brand guides"],
    rating: 4.8,
    reviewCount: 12,
    fromPriceMwk: 45000,
    availability: "available",
    verifiedAt: "2026-07-02"
  }, {
    name: "Chikondi Mwale",
    location: "Lilongwe",
    category: "Video & Photography",
    headline: "Product and event photography, same-week turnaround.",
    skills: ["Product", "Events", "Retouching"],
    rating: 4.9,
    reviewCount: 31,
    fromPriceMwk: 30000,
    availability: "busy",
    verifiedAt: null
  }, {
    name: "Limbani Phiri",
    location: "Mzuzu",
    category: "Animation & Motion",
    headline: "Short explainers and social cutdowns in Chichewa or English.",
    skills: ["After Effects", "Editing", "Sound"],
    rating: null,
    reviewCount: 0,
    fromPriceMwk: null,
    availability: "available",
    verifiedAt: null
  }, {
    name: "Tamandani Nkhoma",
    location: "Blantyre",
    category: "Web & Software",
    headline: "Fast sites for small businesses. Works offline-first.",
    skills: ["Next.js", "Supabase", "SEO"],
    rating: 4.7,
    reviewCount: 8,
    fromPriceMwk: 120000,
    availability: "available",
    verifiedAt: "2026-06-18"
  }, {
    name: "Mphatso Gondwe",
    location: "Zomba",
    category: "Writing & Translation",
    headline: "Copy and translation, English and Chichewa.",
    skills: ["Copywriting", "Chichewa", "Editing"],
    rating: 4.6,
    reviewCount: 5,
    fromPriceMwk: 18000,
    availability: "away",
    verifiedAt: null
  }, {
    name: "Alinafe Kachule",
    location: "Lilongwe",
    category: "Crafts & Handmade",
    headline: "Hand-printed textiles and signage painting.",
    skills: ["Screen printing", "Sign painting"],
    rating: 5,
    reviewCount: 3,
    fromPriceMwk: 25000,
    availability: "available",
    verifiedAt: null
  }],
  jobs: [{
    id: "j1",
    title: "Logo and signage for a new bakery",
    category: "Design",
    postedAgo: "2 days ago",
    clientName: "Grace Phiri",
    budgetMwk: 120000,
    proposalsCount: 4,
    trustBits: ["Has paid into escrow", "Hires 80% of the time", "3 jobs posted"],
    brief: "We open in Limbe next month and need a logo we can put on the shopfront, plus a simple sign layout the printer can work from. Two colours if possible, the sign painter charges by colour."
  }, {
    id: "j2",
    title: "Product photos for 14 jars of honey",
    category: "Video & Photography",
    postedAgo: "6 hours ago",
    clientName: "Madalitso Zimba",
    budgetMwk: 65000,
    proposalsCount: 1,
    trustBits: ["Has paid into escrow"],
    brief: "Plain background, one hero shot and one lifestyle shot per jar. We can bring the jars to you in Blantyre."
  }, {
    id: "j3",
    title: "Chichewa voiceover for a 90-second explainer",
    category: "Music & Audio",
    postedAgo: "1 day ago",
    clientName: "Chimwemwe Trust",
    budgetMwk: null,
    proposalsCount: 7,
    trustBits: ["Hires 60% of the time", "5 jobs posted"],
    brief: "Script is written. We need a warm, clear read — this is for a health campaign going out on community radio."
  }, {
    id: "j4",
    title: "Simple booking site for a guesthouse",
    category: "Web & Software",
    postedAgo: "4 days ago",
    clientName: "Lakeview Rooms",
    budgetMwk: 350000,
    proposalsCount: 12,
    trustBits: ["Has paid into escrow", "2 jobs posted"],
    brief: "Six rooms, a photo gallery, and an enquiry form that reaches WhatsApp. Must work on a slow connection."
  }],
  threads: [{
    name: "Grace Phiri",
    job: "Logo and signage for a new bakery",
    last: "The sign painter says two colours is fine. Can you send the layout by Friday?",
    when: "12:40",
    unread: 2
  }, {
    name: "Madalitso Zimba",
    job: "Product photos for 14 jars of honey",
    last: "Escrow is funded — MWK 65,000 is held.",
    when: "Yesterday",
    unread: 0
  }, {
    name: "Lakeview Rooms",
    job: "Simple booking site for a guesthouse",
    last: "Thanks, we are reading the proposals this week.",
    when: "Mon",
    unread: 0
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/data.js", error: String((e && e.message) || e) }); }

// ui_kits/mobile/MobileScreens.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Resolved at RENDER time, not module-eval time: the design-system bundle
   populates its namespace at the end of the bundle, so a top-level destructure
   here would capture undefined for every component. */
const DS = () => window.GanyuHubDesignSystem_1b2ec0;
const mwk = n => n == null ? "\u2014" : "MWK " + n.toLocaleString("en-GB");
const GUT = 16;

/* ── The app's top bar. Logo + search + bell. No nav — the tab bar owns that. */
function AppBar({
  title,
  back,
  onBack
}) {
  const {
    Logo,
    Icon,
    Button,
    Input,
    Select,
    Label,
    Textarea,
    Badge,
    Card,
    CardContent,
    CreativeCard,
    JobCard,
    FeedCarousel,
    FeedCard,
    MoneyStamp,
    JobProgressBar,
    MoneyInput,
    PricingExplainer,
    PageTabs,
    SearchScope,
    EmptyState,
    Stars,
    VerifiedBadge,
    StyleChoices,
    TagInput,
    SaveButton
  } = DS();
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: "sticky",
      top: 0,
      zIndex: 20,
      background: "var(--surface-bar)",
      backdropFilter: "blur(8px)",
      borderBottom: "1px solid var(--border-hairline)",
      boxShadow: "var(--elev-2)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px " + GUT + "px",
      minHeight: 52
    }
  }, back ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onBack,
    "aria-label": "Back",
    style: {
      display: "flex",
      height: 36,
      width: 36,
      marginLeft: -8,
      alignItems: "center",
      justifyContent: "center",
      border: 0,
      background: "none",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "ArrowLeft",
    size: 20,
    color: "var(--gh-ink)"
  })) : /*#__PURE__*/React.createElement(Logo, {
    size: "sm",
    markSrc: "../../assets/logo-g.png"
  }), title && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      flex: 1,
      minWidth: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      fontSize: "var(--text-base)",
      fontWeight: 600
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto",
      display: "flex",
      alignItems: "center",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Search",
    style: {
      display: "flex",
      height: 44,
      width: 44,
      alignItems: "center",
      justifyContent: "center",
      border: 0,
      background: "none",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Search",
    size: 20,
    color: "var(--gh-ink-70)"
  })), /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Notifications",
    style: {
      position: "relative",
      display: "flex",
      height: 44,
      width: 44,
      alignItems: "center",
      justifyContent: "center",
      border: 0,
      background: "none",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Bell",
    size: 20,
    color: "var(--gh-ink-70)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 11,
      right: 12,
      height: 7,
      width: 7,
      borderRadius: 999,
      background: "var(--gh-teal)"
    }
  })))));
}

/* ── 1. Signed-in home: welcome, ways in, then peeking rails ─────────── */
function HomeFeed({
  go,
  role
}) {
  const {
    Logo,
    Icon,
    Button,
    Input,
    Select,
    Label,
    Textarea,
    Badge,
    Card,
    CardContent,
    CreativeCard,
    JobCard,
    FeedCarousel,
    FeedCard,
    MoneyStamp,
    JobProgressBar,
    MoneyInput,
    PricingExplainer,
    PageTabs,
    SearchScope,
    EmptyState,
    Stars,
    VerifiedBadge,
    StyleChoices,
    TagInput,
    SaveButton
  } = DS();
  const D = window.GH_DATA;
  const client = role === "client";
  const ways = client ? [["Post a job", "Describe it once, get proposals.", "FilePlus", "/jobs/new"], ["Find someone", "Browse people by skill and price.", "Search", "/browse"]] : [["Find work", "Jobs posted this week, with budgets.", "Search", "/jobs"], ["Update your rates", "A rate card gets you more replies.", "List", "/jobs"]];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: GUT + "px " + GUT + "px 0"
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "gh-eyebrow",
    style: {
      margin: 0
    }
  }, "Wednesday, 13 August"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: "6px 0 0",
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-3xl)",
      fontWeight: 600,
      lineHeight: "var(--leading-tight)"
    }
  }, client ? /*#__PURE__*/React.createElement(React.Fragment, null, "Welcome back, ", /*#__PURE__*/React.createElement("i", null, "Grace"), ".") : /*#__PURE__*/React.createElement(React.Fragment, null, "Welcome back, ", /*#__PURE__*/React.createElement("i", null, "Thandiwe"), ".")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "6px 0 0",
      fontSize: "var(--text-sm)",
      color: "var(--gh-ink-65)"
    }
  }, client ? "One job is waiting on your approval." : "MWK 65,000 is held in escrow on two jobs."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: "grid",
      gap: 10
    }
  }, ways.map(([t, s, ic, href]) => /*#__PURE__*/React.createElement("a", {
    key: t,
    href: "#",
    onClick: e => {
      e.preventDefault();
      go(href);
    },
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      borderRadius: "var(--radius-inset)",
      border: "1px solid var(--border-card)",
      background: "var(--gh-white)",
      boxShadow: "var(--shadow-panel-soft)",
      padding: 14,
      textDecoration: "none",
      minHeight: 44
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      height: 40,
      width: 40,
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "var(--radius-panel)",
      background: "var(--gh-teal-10)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: ic,
    size: 20,
    color: "var(--gh-teal-dark)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: "var(--text-sm)",
      fontWeight: 600,
      color: "var(--gh-ink)"
    }
  }, t), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: "var(--text-xs)",
      color: "var(--gh-ink-60)"
    }
  }, s)), /*#__PURE__*/React.createElement(Icon, {
    name: "ArrowRight",
    size: 16,
    color: "var(--gh-ink-40)"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      borderRadius: "var(--radius-card)",
      border: "1px solid var(--gh-ink-10)",
      background: "var(--gh-white)",
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "gh-eyebrow",
    style: {
      margin: 0
    }
  }, "In escrow"), /*#__PURE__*/React.createElement("p", {
    className: "gh-price",
    style: {
      margin: "4px 0 0",
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-3xl)",
      fontVariantNumeric: "tabular-nums"
    }
  }, "185,000")), /*#__PURE__*/React.createElement(MoneyStamp, {
    state: "payment_held"
  })), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      go("/dashboard/jobs");
    },
    style: {
      display: "inline-block",
      marginTop: 10,
      fontSize: "var(--text-xs)",
      fontWeight: 500,
      color: "var(--gh-teal-dark)"
    }
  }, "Across 2 jobs \u2192"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      paddingLeft: GUT
    }
  }, /*#__PURE__*/React.createElement(FeedCarousel, {
    eyebrow: "Near you",
    title: client ? "Creatives in Blantyre" : "Jobs in Blantyre",
    seeAllHref: "#",
    count: D.creatives.length,
    style: {
      "--carousel-card": "232px"
    }
  }, D.creatives.map(c => /*#__PURE__*/React.createElement(FeedCard, {
    key: c.name,
    style: {
      width: 232
    }
  }, /*#__PURE__*/React.createElement(CreativeCard, _extends({}, c, {
    showSave: true
  })))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 28,
      padding: "0 " + GUT + "px"
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "gh-eyebrow",
    style: {
      margin: 0
    }
  }, client ? "Your jobs" : "New this week"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: "4px 0 12px",
      fontSize: "var(--text-lg)",
      fontWeight: 600
    }
  }, client ? "Waiting on you" : "Work you could take"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 12
    }
  }, D.jobs.slice(0, 2).map(j => /*#__PURE__*/React.createElement("div", {
    key: j.id,
    onClick: () => go("/jobs/j1")
  }, /*#__PURE__*/React.createElement(JobCard, _extends({}, j, {
    showSave: true
  })))))));
}

/* ── 2. Jobs list ─────────────────────────────────────────────────────── */
function JobsMobile({
  go
}) {
  const {
    Logo,
    Icon,
    Button,
    Input,
    Select,
    Label,
    Textarea,
    Badge,
    Card,
    CardContent,
    CreativeCard,
    JobCard,
    FeedCarousel,
    FeedCard,
    MoneyStamp,
    JobProgressBar,
    MoneyInput,
    PricingExplainer,
    PageTabs,
    SearchScope,
    EmptyState,
    Stars,
    VerifiedBadge,
    StyleChoices,
    TagInput,
    SaveButton
  } = DS();
  const D = window.GH_DATA;
  const [tab, setTab] = React.useState("all");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: GUT + "px " + GUT + "px 24px"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-2xl)",
      fontWeight: 600
    }
  }, "Find work to do"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(SearchScope, {
    current: "jobs",
    onSelect: k => k === "creatives" && go("/browse"),
    style: {
      gridTemplateColumns: "1fr"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement(PageTabs, {
    active: tab,
    onSelect: setTab,
    tabs: [{
      key: "all",
      label: "All open",
      count: D.jobs.length
    }, {
      key: "funded",
      label: "Client has paid before",
      count: 3
    }, {
      key: "saved",
      label: "Saved"
    }]
  })), tab === "saved" ? /*#__PURE__*/React.createElement(EmptyState, {
    style: {
      marginTop: 20,
      padding: "40px 20px"
    },
    title: "Nothing saved yet",
    body: "Tap the heart on a job to keep it here.",
    actionLabel: "Browse open jobs"
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: "grid",
      gap: 12
    }
  }, (tab === "funded" ? D.jobs.filter(j => j.trustBits.indexOf("Has paid into escrow") > -1) : D.jobs).map(j => /*#__PURE__*/React.createElement("div", {
    key: j.id,
    onClick: () => go("/jobs/j1")
  }, /*#__PURE__*/React.createElement(JobCard, _extends({}, j, {
    showSave: true
  }))))));
}

/* ── 3. Browse creatives ──────────────────────────────────────────────── */
function BrowseMobile({
  go
}) {
  const {
    Logo,
    Icon,
    Button,
    Input,
    Select,
    Label,
    Textarea,
    Badge,
    Card,
    CardContent,
    CreativeCard,
    JobCard,
    FeedCarousel,
    FeedCard,
    MoneyStamp,
    JobProgressBar,
    MoneyInput,
    PricingExplainer,
    PageTabs,
    SearchScope,
    EmptyState,
    Stars,
    VerifiedBadge,
    StyleChoices,
    TagInput,
    SaveButton
  } = DS();
  const D = window.GH_DATA;
  const [cat, setCat] = React.useState("all");
  const list = cat === "all" ? D.creatives : D.creatives.filter(c => c.category === cat);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: GUT + "px 0 24px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 " + GUT + "px"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-2xl)",
      fontWeight: 600
    }
  }, "Find someone to hire"), /*#__PURE__*/React.createElement(Input, {
    placeholder: "e.g. wedding photographer in Lilongwe",
    style: {
      marginTop: 12
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      display: "flex",
      gap: 8,
      overflowX: "auto",
      padding: "0 " + GUT + "px",
      scrollbarWidth: "none"
    }
  }, ["all"].concat(D.categories).map(c => /*#__PURE__*/React.createElement("button", {
    key: c,
    type: "button",
    onClick: () => setCat(c),
    style: {
      flexShrink: 0,
      borderRadius: 999,
      cursor: "pointer",
      padding: "7px 14px",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-xs)",
      fontWeight: 500,
      whiteSpace: "nowrap",
      border: "1px solid " + (cat === c ? "var(--gh-teal)" : "var(--gh-ink-15)"),
      background: cat === c ? "var(--gh-teal)" : "var(--gh-white)",
      color: cat === c ? "#fff" : "var(--gh-ink-70)"
    }
  }, c === "all" ? "All" : c))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      padding: "0 " + GUT + "px"
    }
  }, /*#__PURE__*/React.createElement("details", {
    style: {
      borderRadius: "var(--radius-panel)",
      border: "1px solid var(--gh-ink-10)",
      background: "var(--surface-inset)",
      padding: "10px 12px"
    }
  }, /*#__PURE__*/React.createElement("summary", {
    style: {
      cursor: "pointer",
      listStyle: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontSize: "var(--text-sm)",
      fontWeight: 500
    }
  }, "Visual style", /*#__PURE__*/React.createElement(Icon, {
    name: "ChevronDown",
    size: 14,
    color: "var(--gh-ink-45)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement(StyleChoices, {
    name: "styles",
    selected: ["flat"],
    style: {
      gridTemplateColumns: "repeat(3, minmax(0,1fr))",
      gap: 8
    }
  }))), list.length === 0 ? /*#__PURE__*/React.createElement(EmptyState, {
    style: {
      marginTop: 20,
      padding: "40px 20px"
    },
    title: "Nothing here yet",
    body: "No creatives in this category are taking work right now.",
    actionLabel: "Post a job"
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: "grid",
      gap: 12
    }
  }, list.map(c => /*#__PURE__*/React.createElement(CreativeCard, _extends({
    key: c.name
  }, c, {
    showSave: true
  }))))));
}

/* ── 4. Job detail with the sticky action bar ─────────────────────────── */
function JobDetailMobile({
  go,
  stage,
  setStage
}) {
  const {
    Logo,
    Icon,
    Button,
    Input,
    Select,
    Label,
    Textarea,
    Badge,
    Card,
    CardContent,
    CreativeCard,
    JobCard,
    FeedCarousel,
    FeedCard,
    MoneyStamp,
    JobProgressBar,
    MoneyInput,
    PricingExplainer,
    PageTabs,
    SearchScope,
    EmptyState,
    Stars,
    VerifiedBadge,
    StyleChoices,
    TagInput,
    SaveButton
  } = DS();
  const job = window.GH_DATA.jobs[0];
  const money = stage >= 4 ? "payment_released" : stage >= 2 ? "payment_held" : stage === 1 ? "payment_pending" : "none";
  const action = stage < 2 ? "Fund escrow" : stage === 2 ? "Mark delivered" : stage === 3 ? "Release payment" : "Released";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: GUT + "px " + GUT + "px 96px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: "var(--radius-panel)",
      border: "1px solid var(--gh-ink-10)",
      background: "var(--gh-white)",
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-2xl)",
      fontWeight: 600,
      lineHeight: "var(--leading-tight)"
    }
  }, job.title), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "gh-price",
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-3xl)",
      fontVariantNumeric: "tabular-nums"
    }
  }, job.budgetMwk.toLocaleString("en-GB")), /*#__PURE__*/React.createElement(MoneyStamp, {
    state: money
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      fontSize: "var(--text-sm)",
      color: "var(--gh-ink-70)"
    }
  }, /*#__PURE__*/React.createElement("div", null, money === "payment_released" ? "Creative received, after cash-out fee" : "Creative receives (est., after cash-out fee)"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2,
      display: "flex",
      flexWrap: "wrap",
      gap: "2px 16px"
    }
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 500,
      color: "var(--gh-ink)",
      fontVariantNumeric: "tabular-nums"
    }
  }, mwk(116400)), " to mobile money"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 500,
      color: "var(--gh-ink)",
      fontVariantNumeric: "tabular-nums"
    }
  }, mwk(115700)), " to bank"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20
    }
  }, /*#__PURE__*/React.createElement(JobProgressBar, {
    currentIdx: stage
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      borderRadius: "var(--radius-card)",
      border: "1px solid var(--border-card)",
      background: "var(--gh-white)",
      boxShadow: "var(--shadow-listing)",
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "gh-eyebrow",
    style: {
      margin: 0
    }
  }, "The brief"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "10px 0 0",
      fontSize: "var(--text-sm)",
      lineHeight: "var(--leading-relaxed)",
      color: "var(--gh-ink-80)",
      textWrap: "pretty"
    }
  }, job.brief), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: "grid",
      gap: 6,
      fontSize: "var(--text-xs)",
      color: "var(--gh-ink-70)"
    }
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--gh-ink-55)"
    }
  }, "Posted"), " ", job.postedAgo, " by ", job.clientName), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--gh-ink-55)"
    }
  }, "Deadline"), " 14th of September 2026"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement(PricingExplainer, {
    audience: "client"
  })), /*#__PURE__*/React.createElement("p", {
    className: "gh-eyebrow",
    style: {
      margin: "24px 0 10px"
    }
  }, "Proposals \xB7 ", job.proposalsCount), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 12
    }
  }, window.GH_DATA.creatives.slice(0, 2).map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: c.name,
    style: {
      borderRadius: "var(--radius-card)",
      border: "1px solid var(--border-card)",
      background: "var(--gh-white)",
      boxShadow: "var(--shadow-listing)",
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      height: 36,
      width: 36,
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 999,
      background: "var(--gh-ink-85)",
      fontSize: "var(--text-11)",
      fontWeight: 600,
      color: "var(--gh-ground)"
    }
  }, c.name.split(" ").map(n => n[0]).join("")), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-sm)",
      fontWeight: 600
    }
  }, c.name), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 5,
      marginTop: 2
    }
  }, c.reviewCount > 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Stars, {
    value: c.rating,
    size: 12
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-11)",
      color: "var(--gh-ink-60)"
    }
  }, c.rating.toFixed(1), " \xB7 ", c.reviewCount, " reviews")) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-11)",
      color: "var(--gh-ink-60)"
    }
  }, "New \xB7 no reviews yet"))), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto"
    }
  }, /*#__PURE__*/React.createElement(VerifiedBadge, {
    verifiedAt: c.verifiedAt
  }))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "10px 0 0",
      fontSize: "var(--text-sm)",
      lineHeight: "var(--leading-relaxed)",
      color: "var(--gh-ink-75)"
    }
  }, ["I would do the wordmark first so the sign painter can quote before the rest is finished. Two colours, and I will supply the paint codes.", "I have done three shopfronts in Limbe. I can share the files the painter used."][i]), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      borderRadius: "var(--radius-panel)",
      background: "var(--gh-mark-10)",
      padding: "5px 10px",
      fontSize: "var(--text-sm)",
      fontWeight: 600,
      color: "var(--gh-mark)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "HandCoins",
    size: 14
  }), mwk([115000, 120000][i])), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    onClick: () => setStage(1)
  }, "Hire"))))));
}

/* ── 5. Messages ──────────────────────────────────────────────────────── */
function MessagesMobile({
  go
}) {
  const {
    Logo,
    Icon,
    Button,
    Input,
    Select,
    Label,
    Textarea,
    Badge,
    Card,
    CardContent,
    CreativeCard,
    JobCard,
    FeedCarousel,
    FeedCard,
    MoneyStamp,
    JobProgressBar,
    MoneyInput,
    PricingExplainer,
    PageTabs,
    SearchScope,
    EmptyState,
    Stars,
    VerifiedBadge,
    StyleChoices,
    TagInput,
    SaveButton
  } = DS();
  const D = window.GH_DATA;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: GUT + "px " + GUT + "px 0"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-2xl)",
      fontWeight: 600
    }
  }, "Messages")), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: "12px 0 0",
      padding: 0,
      listStyle: "none"
    }
  }, D.threads.map(t => /*#__PURE__*/React.createElement("li", {
    key: t.name
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      go("/jobs/j1");
    },
    style: {
      display: "flex",
      gap: 12,
      alignItems: "flex-start",
      padding: "14px " + GUT + "px",
      borderBottom: "1px solid var(--gh-ink-07)",
      textDecoration: "none",
      minHeight: 44
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      height: 40,
      width: 40,
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 999,
      background: "var(--gh-ink-85)",
      fontSize: "var(--text-xs)",
      fontWeight: 600,
      color: "var(--gh-ground)"
    }
  }, t.name.split(" ").map(n => n[0]).join("")), /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: t.unread ? 600 : 500,
      color: "var(--gh-ink)"
    }
  }, t.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-10)",
      color: "var(--gh-ink-45)",
      whiteSpace: "nowrap"
    }
  }, t.when)), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      marginTop: 1,
      fontSize: "var(--text-11)",
      color: "var(--gh-ink-55)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, t.job), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      marginTop: 4,
      fontSize: "var(--text-xs)",
      lineHeight: "var(--leading-snug)",
      color: t.unread ? "var(--gh-ink-80)" : "var(--gh-ink-60)"
    }
  }, t.last)), t.unread > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      flexShrink: 0,
      minWidth: 18,
      borderRadius: 999,
      background: "var(--gh-teal)",
      padding: "0 5px",
      fontSize: "var(--text-10)",
      fontWeight: 700,
      lineHeight: "18px",
      color: "var(--gh-ground)",
      textAlign: "center"
    }
  }, t.unread))))));
}

/* ── 6. Post a job (the deliberate button, not a tab) ─────────────────── */
function PostJobMobile({
  go
}) {
  const {
    Logo,
    Icon,
    Button,
    Input,
    Select,
    Label,
    Textarea,
    Badge,
    Card,
    CardContent,
    CreativeCard,
    JobCard,
    FeedCarousel,
    FeedCard,
    MoneyStamp,
    JobProgressBar,
    MoneyInput,
    PricingExplainer,
    PageTabs,
    SearchScope,
    EmptyState,
    Stars,
    VerifiedBadge,
    StyleChoices,
    TagInput,
    SaveButton
  } = DS();
  const [step, setStep] = React.useState(0);
  const steps = ["What you need", "Budget & deadline", "Review"];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: GUT + "px " + GUT + "px 96px"
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "gh-eyebrow",
    style: {
      margin: 0
    }
  }, "Step ", step + 1, " of 3"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: "6px 0 0",
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-2xl)",
      fontWeight: 600
    }
  }, steps[step]), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      display: "flex",
      gap: 4
    }
  }, steps.map((s, i) => /*#__PURE__*/React.createElement("span", {
    key: s,
    style: {
      height: 3,
      flex: 1,
      borderRadius: 999,
      background: i <= step ? "var(--gh-teal)" : "var(--gh-ink-10)",
      transition: "background-color var(--dur-panel) var(--ease-out)"
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20,
      display: "grid",
      gap: 16
    }
  }, step === 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Label, {
    htmlFor: "t"
  }, "What do you need done?"), /*#__PURE__*/React.createElement(Input, {
    id: "t",
    defaultValue: "Logo and signage for a new bakery",
    style: {
      marginTop: 6
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Label, {
    htmlFor: "c"
  }, "Category"), /*#__PURE__*/React.createElement(Select, {
    id: "c",
    defaultValue: "Design",
    style: {
      marginTop: 6
    }
  }, window.GH_DATA.categories.map(c => /*#__PURE__*/React.createElement("option", {
    key: c
  }, c)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Label, {
    htmlFor: "b"
  }, "Describe the work"), /*#__PURE__*/React.createElement(Textarea, {
    id: "b",
    rows: 5,
    defaultValue: window.GH_DATA.jobs[0].brief,
    style: {
      marginTop: 6
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "4px 0 0",
      fontSize: "var(--text-11)",
      color: "var(--gh-ink-55)"
    }
  }, "The more specific you are, the fewer questions you will get back.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Label, null, "Skills you are looking for"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement(TagInput, {
    name: "skills",
    defaultValue: ["Logo design"],
    placeholder: "Add a skill"
  })))), step === 1 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Label, {
    htmlFor: "bud"
  }, "Your budget"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement(MoneyInput, {
    id: "bud",
    name: "budget_mwk",
    defaultValue: 120000
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "4px 0 0",
      fontSize: "var(--text-11)",
      color: "var(--gh-ink-55)"
    }
  }, "You can leave this open, but jobs with a budget get about twice as many proposals.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Label, {
    htmlFor: "d"
  }, "Deadline"), /*#__PURE__*/React.createElement(Input, {
    id: "d",
    type: "date",
    defaultValue: "2026-09-14",
    style: {
      marginTop: 6
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Label, {
    htmlFor: "l"
  }, "Where is the work?"), /*#__PURE__*/React.createElement(Input, {
    id: "l",
    defaultValue: "Limbe, Blantyre",
    style: {
      marginTop: 6
    }
  })), /*#__PURE__*/React.createElement(PricingExplainer, {
    audience: "client"
  })), step === 2 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: "var(--radius-card)",
      border: "1px solid var(--border-card)",
      background: "var(--gh-white)",
      boxShadow: "var(--shadow-listing)",
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-xl)",
      fontWeight: 600
    }
  }, "Logo and signage for a new bakery"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      borderRadius: "var(--radius-panel)",
      background: "var(--gh-mark-10)",
      padding: "6px 12px",
      fontSize: "var(--text-sm)",
      fontWeight: 600,
      color: "var(--gh-mark)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "HandCoins",
    size: 16
  }), "Budget: ", mwk(120000)), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "12px 0 0",
      fontSize: "var(--text-sm)",
      lineHeight: "var(--leading-relaxed)",
      color: "var(--gh-ink-75)"
    }
  }, window.GH_DATA.jobs[0].brief)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 10,
      borderRadius: "var(--radius-panel)",
      background: "var(--surface-inset)",
      border: "1px solid var(--gh-ink-10)",
      padding: 14
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "ShieldCheck",
    size: 18,
    color: "var(--gh-teal)"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-xs)",
      lineHeight: "var(--leading-snug)",
      color: "var(--gh-ink-70)"
    }
  }, "Posting is free. Nothing leaves your account until you pick someone and fund the job.")))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      display: "flex",
      gap: 10
    }
  }, step > 0 && /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "lg",
    onClick: () => setStep(step - 1),
    style: {
      flex: 1
    }
  }, "Back"), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    style: {
      flex: 2
    },
    onClick: () => step < 2 ? setStep(step + 1) : go("/jobs/j1")
  }, step < 2 ? "Continue" : "Post the job")));
}
Object.assign(window, {
  AppBar,
  HomeFeed,
  JobsMobile,
  BrowseMobile,
  JobDetailMobile,
  MessagesMobile,
  PostJobMobile
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/MobileScreens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/BrowseCreatives.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Resolved at RENDER time, not module-eval time: the design-system bundle
   populates its namespace at the end of the bundle, so a top-level destructure
   here would capture undefined for every component. */
const DS = () => window.GanyuHubDesignSystem_1b2ec0;
function BrowseCreatives({
  go
}) {
  const {
    CreativeCard,
    SearchScope,
    PageTabs,
    Input,
    Select,
    Button,
    Badge,
    StyleChoices,
    EmptyState,
    Icon
  } = DS();
  const D = window.GH_DATA;
  const [cat, setCat] = React.useState("all");
  const [open, setOpen] = React.useState(true);
  const list = cat === "all" ? D.creatives : D.creatives.filter(c => c.category === cat);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      margin: "0 auto",
      maxWidth: "var(--page-max)",
      padding: "32px var(--gutter-md) 80px"
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "gh-eyebrow",
    style: {
      margin: 0
    }
  }, "Browse"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: "6px 0 0",
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-3xl)",
      fontWeight: 600
    }
  }, "Find someone to hire"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20,
      maxWidth: 720
    }
  }, /*#__PURE__*/React.createElement(SearchScope, {
    current: "creatives",
    onSelect: k => k === "jobs" && go("/jobs")
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      display: "grid",
      gridTemplateColumns: "260px 1fr",
      gap: 32,
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("aside", {
    style: {
      position: "sticky",
      top: 76,
      borderRadius: "var(--radius-panel)",
      border: "1px solid var(--gh-ink-10)",
      background: "var(--gh-white)",
      boxShadow: "var(--shadow-panel-soft)",
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-sm)",
      fontWeight: 600
    }
  }, "Filters"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setCat("all"),
    style: {
      border: 0,
      background: "none",
      padding: 0,
      cursor: "pointer",
      fontSize: "var(--text-xs)",
      fontWeight: 500,
      color: "var(--gh-teal-dark)"
    }
  }, "Clear all")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: "var(--gh-ink)",
      opacity: 0.18,
      margin: "12px 0"
    }
  }), /*#__PURE__*/React.createElement("p", {
    className: "gh-eyebrow",
    style: {
      margin: "0 0 8px"
    }
  }, "Category"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 4
    }
  }, ["all"].concat(D.categories).map(c => /*#__PURE__*/React.createElement("button", {
    key: c,
    type: "button",
    onClick: () => setCat(c),
    style: {
      textAlign: "left",
      border: 0,
      borderRadius: "var(--radius-control)",
      cursor: "pointer",
      padding: "7px 10px",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-sm)",
      background: cat === c ? "var(--gh-teal-10)" : "transparent",
      fontWeight: cat === c ? 500 : 400,
      color: cat === c ? "var(--gh-teal-dark)" : "var(--gh-ink-70)"
    }
  }, c === "all" ? "All categories" : c))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: "var(--gh-ink)",
      opacity: 0.18,
      margin: "14px 0"
    }
  }), /*#__PURE__*/React.createElement("p", {
    className: "gh-eyebrow",
    style: {
      margin: "0 0 8px"
    }
  }, "Budget from"), /*#__PURE__*/React.createElement(Select, {
    defaultValue: "Any"
  }, /*#__PURE__*/React.createElement("option", null, "Any"), /*#__PURE__*/React.createElement("option", null, "MWK 20,000+"), /*#__PURE__*/React.createElement("option", null, "MWK 50,000+"), /*#__PURE__*/React.createElement("option", null, "MWK 100,000+")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: "var(--gh-ink)",
      opacity: 0.18,
      margin: "14px 0"
    }
  }), /*#__PURE__*/React.createElement("details", {
    open: open,
    onToggle: e => setOpen(e.currentTarget.open)
  }, /*#__PURE__*/React.createElement("summary", {
    style: {
      cursor: "pointer",
      listStyle: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "gh-eyebrow"
  }, "Visual style"), /*#__PURE__*/React.createElement(Icon, {
    name: "ChevronDown",
    size: 14,
    color: "var(--gh-ink-45)",
    style: {
      transform: open ? "rotate(180deg)" : "none",
      transition: "transform var(--dur-panel) var(--ease-out)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement(StyleChoices, {
    name: "styles",
    selected: ["flat"],
    style: {
      gridTemplateColumns: "repeat(3, minmax(0,1fr))",
      gap: 8
    }
  })))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-sm)",
      color: "var(--gh-ink-65)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      color: "var(--gh-ink)"
    }
  }, list.length), " ", list.length === 1 ? "creative" : "creatives", cat !== "all" ? " in " + cat : ""), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      color: "var(--gh-ink-55)"
    }
  }, "Sort"), /*#__PURE__*/React.createElement(Select, {
    defaultValue: "Recommended",
    style: {
      width: 190
    }
  }, /*#__PURE__*/React.createElement("option", null, "Recommended"), /*#__PURE__*/React.createElement("option", null, "Highest rated"), /*#__PURE__*/React.createElement("option", null, "Lowest price"), /*#__PURE__*/React.createElement("option", null, "Newest")))), list.length === 0 ? /*#__PURE__*/React.createElement(EmptyState, {
    style: {
      marginTop: 24
    },
    title: "Nothing here yet",
    body: "No creatives in this category are taking work right now. Try another category, or post a job and let people come to you.",
    actionLabel: "Post a job"
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0,1fr))",
      gap: 16
    }
  }, list.map(c => /*#__PURE__*/React.createElement(CreativeCard, _extends({
    key: c.name
  }, c, {
    showSave: true
  })))))));
}
Object.assign(window, {
  BrowseCreatives
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/BrowseCreatives.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/JobDetail.jsx
try { (() => {
/* Resolved at RENDER time, not module-eval time: the design-system bundle
   populates its namespace at the end of the bundle, so a top-level destructure
   here would capture undefined for every component. */
const DS = () => window.GanyuHubDesignSystem_1b2ec0;
const mwk = n => n == null ? "\u2014" : "MWK " + n.toLocaleString("en-GB");
function EscrowRow({
  label,
  value,
  strong
}) {
  const {
    MoneyStamp,
    JobProgressBar,
    Button,
    Card,
    CardContent,
    Badge,
    PricingExplainer,
    Stars,
    VerifiedBadge,
    PageTabs,
    Textarea,
    Icon,
    EmptyState
  } = DS();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: 12,
      padding: "7px 0",
      borderBottom: "1px solid var(--gh-ink-07)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--gh-ink-65)"
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontVariantNumeric: "tabular-nums",
      fontSize: "var(--text-sm)",
      fontWeight: strong ? 600 : 400,
      color: strong ? "var(--gh-ink)" : "var(--gh-ink-75)"
    }
  }, value));
}
function JobDetail({
  go
}) {
  const {
    MoneyStamp,
    JobProgressBar,
    Button,
    Card,
    CardContent,
    Badge,
    PricingExplainer,
    Stars,
    VerifiedBadge,
    PageTabs,
    Textarea,
    Icon,
    EmptyState
  } = DS();
  const job = window.GH_DATA.jobs[0];
  const [stage, setStage] = React.useState(2);
  const [tab, setTab] = React.useState("proposals");
  const money = stage >= 4 ? "payment_released" : stage >= 2 ? "payment_held" : stage === 1 ? "payment_pending" : "none";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      margin: "0 auto",
      maxWidth: "var(--page-max)",
      padding: "24px var(--gutter-md) 80px"
    }
  }, /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontSize: "var(--text-xs)",
      color: "var(--gh-ink-55)"
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      go("/jobs");
    },
    style: {
      color: "var(--gh-ink-55)",
      textDecoration: "none"
    }
  }, "Find work"), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true
  }, "/"), /*#__PURE__*/React.createElement("span", null, job.category), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true
  }, "/"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--gh-ink-75)"
    }
  }, job.title)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: "grid",
      gridTemplateColumns: "1fr 340px",
      gap: 32,
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: "var(--radius-panel)",
      border: "1px solid var(--gh-ink-10)",
      background: "var(--gh-white)",
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-3xl)",
      fontWeight: 600,
      lineHeight: "var(--leading-tight)"
    }
  }, job.title), /*#__PURE__*/React.createElement(Badge, {
    tone: "wash"
  }, job.category)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "gh-price",
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-4xl)",
      fontVariantNumeric: "tabular-nums"
    }
  }, job.budgetMwk.toLocaleString("en-GB")), /*#__PURE__*/React.createElement(MoneyStamp, {
    state: money,
    size: "lg"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      fontSize: "var(--text-sm)",
      color: "var(--gh-ink-70)"
    }
  }, /*#__PURE__*/React.createElement("div", null, money === "payment_released" ? "Creative received, after cash-out fee" : "Creative receives (est., after cash-out fee)"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2,
      display: "flex",
      flexWrap: "wrap",
      gap: "2px 20px"
    }
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 500,
      color: "var(--gh-ink)",
      fontVariantNumeric: "tabular-nums"
    }
  }, mwk(116400)), " to mobile money"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 500,
      color: "var(--gh-ink)",
      fontVariantNumeric: "tabular-nums"
    }
  }, mwk(115700)), " to bank")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4,
      fontSize: "var(--text-xs)",
      color: "var(--gh-ink-55)"
    }
  }, "Cash-out fees are charged by the payment provider, not Ganyu Hub \u2014 banks add a flat MWK 700 on top of the 3% both rails charge.")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement(JobProgressBar, {
    currentIdx: stage
  }))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardContent, {
    style: {
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "gh-eyebrow",
    style: {
      margin: 0
    }
  }, "The brief"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "10px 0 0",
      fontSize: "var(--text-base)",
      lineHeight: "var(--leading-relaxed)",
      color: "var(--gh-ink-80)",
      textWrap: "pretty"
    }
  }, job.brief), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20,
      display: "flex",
      flexWrap: "wrap",
      gap: "8px 32px",
      fontSize: "var(--text-sm)",
      color: "var(--gh-ink-70)"
    }
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--gh-ink-55)"
    }
  }, "Posted"), " ", job.postedAgo), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--gh-ink-55)"
    }
  }, "Deadline"), " 14th of September 2026"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--gh-ink-55)"
    }
  }, "Location"), " Limbe, Blantyre")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageTabs, {
    active: tab,
    onSelect: setTab,
    tabs: [{
      key: "proposals",
      label: "Proposals",
      count: job.proposalsCount
    }, {
      key: "messages",
      label: "Messages",
      count: 2
    }, {
      key: "files",
      label: "Files"
    }, {
      key: "activity",
      label: "Activity"
    }]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, tab === "proposals" && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 12
    }
  }, window.GH_DATA.creatives.slice(0, 3).map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: c.name,
    style: {
      borderRadius: "var(--radius-card)",
      border: "1px solid rgba(0,0,0,0.06)",
      background: "var(--gh-white)",
      boxShadow: "var(--shadow-listing)",
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      height: 40,
      width: 40,
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 999,
      background: "var(--gh-ink-85)",
      fontSize: "var(--text-xs)",
      fontWeight: 600,
      color: "var(--gh-ground)"
    }
  }, c.name.split(" ").map(n => n[0]).join("")), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-sm)",
      fontWeight: 600
    }
  }, c.name), /*#__PURE__*/React.createElement(VerifiedBadge, {
    verifiedAt: c.verifiedAt
  }), c.reviewCount > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      fontSize: "var(--text-xs)",
      color: "var(--gh-ink-60)"
    }
  }, /*#__PURE__*/React.createElement(Stars, {
    value: c.rating,
    size: 13
  }), c.rating.toFixed(1))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "6px 0 0",
      fontSize: "var(--text-sm)",
      lineHeight: "var(--leading-relaxed)",
      color: "var(--gh-ink-75)"
    }
  }, ["I would do the wordmark first so the sign painter can quote before the rest is finished. Two colours, and I will supply the paint codes.", "I have done three shopfronts in Limbe. I can share the files the painter used.", "Happy to work to your budget. I would need the bakery name and any photos of the shopfront."][i]), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      borderRadius: "var(--radius-panel)",
      background: "var(--gh-mark-10)",
      padding: "5px 10px",
      fontSize: "var(--text-sm)",
      fontWeight: 600,
      color: "var(--gh-mark)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "HandCoins",
    size: 14
  }), mwk([115000, 120000, 98000][i])), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "sm"
  }, "Message"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    onClick: () => setStage(1)
  }, "Hire ", c.name.split(" ")[0])))))))), tab === "messages" && /*#__PURE__*/React.createElement(EmptyState, {
    tone: "quiet",
    title: "No messages on this job yet.",
    body: "Message a creative from their proposal and the thread appears here."
  }), tab === "files" && /*#__PURE__*/React.createElement(EmptyState, {
    title: "No files yet",
    body: "Delivered work and reference files both land here. Nothing has been uploaded."
  }), tab === "activity" && /*#__PURE__*/React.createElement("ol", {
    style: {
      margin: 0,
      padding: 0,
      listStyle: "none",
      display: "grid",
      gap: 0
    }
  }, [["Money moved into escrow", "MWK 120,000 held", "3 days ago"], ["Thandiwe Banda hired", "Bid accepted at MWK 115,000", "4 days ago"], ["Job posted", "Budget MWK 120,000", "5 days ago"]].map(([t, s, w]) => /*#__PURE__*/React.createElement("li", {
    key: t,
    style: {
      display: "flex",
      justifyContent: "space-between",
      gap: 16,
      padding: "12px 0",
      borderBottom: "1px solid var(--gh-ink-07)"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-sm)",
      fontWeight: 500
    }
  }, t), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "2px 0 0",
      fontSize: "var(--text-xs)",
      color: "var(--gh-ink-60)"
    }
  }, s)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-11)",
      color: "var(--gh-ink-45)",
      whiteSpace: "nowrap"
    }
  }, w))))))), /*#__PURE__*/React.createElement("aside", {
    style: {
      position: "sticky",
      top: 76,
      display: "grid",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardContent, {
    style: {
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "gh-eyebrow",
    style: {
      margin: 0
    }
  }, "Escrow"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement(EscrowRow, {
    label: "Agreed price",
    value: mwk(115000)
  }), /*#__PURE__*/React.createElement(EscrowRow, {
    label: "Processing fee (~3%)",
    value: mwk(3450)
  }), /*#__PURE__*/React.createElement(EscrowRow, {
    label: "Platform commission",
    value: "MWK 0 (beta)"
  }), /*#__PURE__*/React.createElement(EscrowRow, {
    label: "You pay",
    value: mwk(118450),
    strong: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: "grid",
      gap: 8
    }
  }, stage < 2 && /*#__PURE__*/React.createElement(Button, {
    style: {
      width: "100%"
    },
    onClick: () => setStage(2)
  }, "Fund escrow \xB7 ", mwk(118450)), stage === 2 && /*#__PURE__*/React.createElement(Button, {
    style: {
      width: "100%"
    },
    onClick: () => setStage(3)
  }, "Mark work delivered"), stage === 3 && /*#__PURE__*/React.createElement(Button, {
    style: {
      width: "100%"
    },
    onClick: () => setStage(4)
  }, "Approve & release payment"), stage >= 4 && /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    style: {
      width: "100%"
    },
    disabled: true
  }, "Released to creative"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    style: {
      width: "100%"
    }
  }, "Message Thandiwe"), stage > 0 && stage < 4 && /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    style: {
      width: "100%",
      color: "var(--status-danger)"
    }
  }, "Open a dispute")))), /*#__PURE__*/React.createElement(PricingExplainer, {
    audience: "client"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: "var(--radius-panel)",
      border: "1px solid var(--gh-ink-10)",
      background: "var(--surface-inset)",
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-sm)",
      fontWeight: 600
    }
  }, "About ", job.clientName), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: "8px 0 0",
      padding: 0,
      listStyle: "none",
      display: "grid",
      gap: 5,
      fontSize: "var(--text-xs)",
      color: "var(--gh-ink-70)"
    }
  }, job.trustBits.map(b => /*#__PURE__*/React.createElement("li", {
    key: b,
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Check",
    size: 13,
    color: "var(--gh-mark)"
  }), b)), /*#__PURE__*/React.createElement("li", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Clock",
    size: 13,
    color: "var(--gh-ink-45)"
  }), "Usually replies within a day"))))));
}
Object.assign(window, {
  JobDetail
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/JobDetail.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/JobsList.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Resolved at RENDER time, not module-eval time: the design-system bundle
   populates its namespace at the end of the bundle, so a top-level destructure
   here would capture undefined for every component. */
const DS = () => window.GanyuHubDesignSystem_1b2ec0;
function JobsList({
  go
}) {
  const {
    JobCard,
    SearchScope,
    Select,
    PageTabs,
    EmptyState
  } = DS();
  const D = window.GH_DATA;
  const [tab, setTab] = React.useState("all");
  const list = tab === "funded" ? D.jobs.filter(j => j.trustBits.indexOf("Has paid into escrow") > -1) : D.jobs;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      margin: "0 auto",
      maxWidth: "var(--page-max)",
      padding: "32px var(--gutter-md) 80px"
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "gh-eyebrow",
    style: {
      margin: 0
    }
  }, "Open jobs"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: "6px 0 0",
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-3xl)",
      fontWeight: 600
    }
  }, "Find work to do"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20,
      maxWidth: 720
    }
  }, /*#__PURE__*/React.createElement(SearchScope, {
    current: "jobs",
    onSelect: k => k === "creatives" && go("/browse")
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      display: "flex",
      flexWrap: "wrap",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(PageTabs, {
    active: tab,
    onSelect: setTab,
    tabs: [{
      key: "all",
      label: "All open",
      count: D.jobs.length
    }, {
      key: "funded",
      label: "Client has paid before",
      count: 3
    }, {
      key: "saved",
      label: "Saved"
    }]
  }), /*#__PURE__*/React.createElement(Select, {
    defaultValue: "Newest",
    style: {
      width: 180
    }
  }, /*#__PURE__*/React.createElement("option", null, "Newest"), /*#__PURE__*/React.createElement("option", null, "Highest budget"), /*#__PURE__*/React.createElement("option", null, "Fewest proposals"))), tab === "saved" ? /*#__PURE__*/React.createElement(EmptyState, {
    style: {
      marginTop: 24
    },
    title: "Nothing saved yet",
    body: "Tap the heart on a job to keep it here while you decide whether to write a proposal.",
    actionLabel: "Browse open jobs"
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20,
      display: "grid",
      gap: 16
    }
  }, list.map(j => /*#__PURE__*/React.createElement("div", {
    key: j.id,
    onClick: () => go("/jobs/j1"),
    style: {
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement(JobCard, _extends({}, j, {
    showSave: true
  }))))));
}
Object.assign(window, {
  JobsList
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/JobsList.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/MarketingHome.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Resolved at RENDER time, not module-eval time: the design-system bundle
   populates its namespace at the end of the bundle, so a top-level destructure
   here would capture undefined for every component. */
const DS = () => window.GanyuHubDesignSystem_1b2ec0;

/* The two-mode hero. Client mode is paper on ink; creative mode inverts to
   black on paper with a lighter teal accent. Copy is verbatim from the product. */
const HERO = {
  client: {
    bg: "#F7F6F3",
    text: "hsl(0, 14%, 17%)",
    textMuted: "hsla(0, 14%, 17%, 0.70)",
    accent: "hsl(180, 92%, 30%)",
    badgeBorder: "rgba(0,0,0,0.10)",
    badgeBg: "rgba(255,255,255,0.60)",
    primaryBg: "hsl(180, 92%, 30%)",
    primaryText: "#FFFFFF",
    secondaryBorder: "rgba(0,0,0,0.15)",
    searchBorder: "hsla(180, 92%, 30%, 0.30)",
    searchBg: "#FFFFFF",
    tabBarBg: "rgba(0,0,0,0.05)",
    cityText: "hsla(0, 14%, 17%, 0.65)",
    badge: "Malawi's creative marketplace \u2726",
    line1: "Hire",
    line2: "Malawian creatives.",
    line2Italic: false,
    sub: "A working press for designers, developers, photographers, and writers across Lilongwe, Blantyre, and Mzuzu.",
    placeholder: "e.g. wedding photographer in Lilongwe",
    primaryLabel: "Post a job",
    secondaryLabel: "Browse creatives",
    rightLabel: "BROWSE BY SKILL"
  },
  creative: {
    bg: "#000000",
    text: "hsl(43, 33%, 94%)",
    textMuted: "hsla(43, 33%, 94%, 0.70)",
    accent: "hsl(180, 60%, 55%)",
    badgeBorder: "rgba(255,255,255,0.15)",
    badgeBg: "rgba(255,255,255,0.05)",
    primaryBg: "hsl(43, 33%, 94%)",
    primaryText: "#000000",
    secondaryBorder: "rgba(255,255,255,0.20)",
    searchBorder: "hsla(43, 33%, 94%, 0.30)",
    searchBg: "rgba(255,255,255,0.05)",
    tabBarBg: "rgba(255,255,255,0.06)",
    cityText: "hsla(43, 33%, 94%, 0.50)",
    badge: "Get hired. Get paid. In MWK. \u2726",
    line1: "Get hired.",
    line2: "Show your work.",
    line2Italic: true,
    sub: "Join Malawi's first creative marketplace. Build your portfolio, set your rates, and get paid for what you know how to do.",
    placeholder: "e.g. logo design jobs in Blantyre",
    primaryLabel: "Join as a creative",
    secondaryLabel: "Browse open jobs",
    rightLabel: "FIND JOBS BY SKILL"
  }
};
const VALUE_PROPS = [{
  icon: "ShieldCheck",
  title: "Money is held in escrow",
  body: "The client funds the job before work starts. We hold it. The creative gets paid when the work is approved \u2014 nobody has to trust a stranger."
}, {
  icon: "Smartphone",
  title: "Paid in MWK, to Airtel Money, Mpamba or your bank",
  body: "No foreign currency, no card required, no waiting on an international transfer. Malawian kwacha, into the account you already use."
}, {
  icon: "BadgeCheck",
  title: "Real Malawian creatives",
  body: "Designers, developers, photographers and writers working in Blantyre, Lilongwe and Mzuzu. Judged on the work they have shipped, not on a certificate."
}, {
  icon: "Scale",
  title: "Disputes are handled by a person",
  body: "If something goes wrong, a human reads both sides and decides. Not a form, not a chatbot, not silence."
}];
const STEPS = {
  client: [["Post what you need", "Describe the work and your budget. It takes a few minutes and costs nothing."], ["Pick someone", "Read proposals, look at portfolios, message the ones you like."], ["Fund the job", "Pay the agreed price into escrow. The creative can see it is there, and cannot touch it."], ["Approve and release", "Happy with the work? Release the money. Not happy? Open a dispute."]],
  creative: [["Build your profile", "Show the work you have already done and set your rates."], ["Send proposals", "Reply to jobs that fit. Say what you would do and what it costs."], ["Do the work", "The money is already in escrow before you start, so you know it exists."], ["Get paid in MWK", "Approved work releases to your Airtel Money, Mpamba or bank account."]]
};
function MarketingHome({
  mode,
  setMode,
  go
}) {
  const {
    Button,
    Icon,
    Badge,
    CreativeCard,
    JobCard,
    FeedCarousel,
    FeedCard
  } = DS();
  const t = HERO[mode];
  const D = window.GH_DATA;
  const [stepMode, setStepMode] = React.useState("client");
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("section", {
    style: {
      position: "relative",
      width: "100%",
      overflow: "hidden",
      background: t.bg,
      color: t.text,
      transition: "background-color var(--dur-theme) var(--ease-out), color var(--dur-theme) var(--ease-out)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      margin: "0 auto",
      maxWidth: "var(--page-max)",
      display: "grid",
      gridTemplateColumns: "1.6fr 1fr",
      gap: 48,
      padding: "32px var(--gutter-md)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      borderRadius: 999,
      border: "1px solid " + t.badgeBorder,
      background: t.badgeBg,
      padding: "2px 12px",
      fontSize: "var(--text-xs)",
      fontWeight: 500,
      color: t.text
    }
  }, t.badge), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: "12px 0 0",
      fontFamily: "var(--font-display)",
      fontSize: 50,
      fontWeight: 600,
      lineHeight: 1.04,
      letterSpacing: "-0.025em"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block"
    }
  }, t.line1), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      marginTop: 4,
      fontStyle: t.line2Italic ? "italic" : "normal",
      color: t.accent
    }
  }, t.line2)), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "12px 0 0",
      maxWidth: "36rem",
      fontSize: "var(--text-base)",
      lineHeight: "var(--leading-relaxed)",
      color: t.textMuted
    }
  }, t.sub), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      maxWidth: 640,
      display: "grid",
      gap: 8,
      justifyItems: "start"
    }
  }, /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      borderRadius: 999,
      background: t.tabBarBg,
      padding: 4
    }
  }, [["client", "Briefcase", "I want to hire"], ["creative", "Palette", "I want to find work"]].map(([m, ic, label]) => /*#__PURE__*/React.createElement("button", {
    key: m,
    type: "button",
    role: "tab",
    "aria-selected": mode === m,
    onClick: () => setMode(m),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      borderRadius: 999,
      border: 0,
      cursor: "pointer",
      padding: "6px 16px",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-sm)",
      fontWeight: 500,
      background: mode === m ? t.primaryBg : "transparent",
      color: mode === m ? t.primaryText : t.text,
      transition: "background-color var(--dur-theme) var(--ease-out), color var(--dur-theme) var(--ease-out)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: ic,
    size: 16
  }), label))), /*#__PURE__*/React.createElement("form", {
    onSubmit: e => e.preventDefault(),
    style: {
      display: "flex",
      width: "100%",
      alignItems: "stretch",
      borderRadius: "var(--radius-panel)",
      border: "1px solid " + t.searchBorder,
      background: t.searchBg,
      padding: 6
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "search",
    placeholder: t.placeholder,
    "aria-label": "Search",
    style: {
      minWidth: 0,
      flex: 1,
      background: "transparent",
      border: 0,
      padding: "12px",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-base)",
      color: t.text,
      outline: "none"
    }
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    style: {
      display: "flex",
      height: 44,
      alignItems: "center",
      gap: 8,
      borderRadius: "var(--radius-control)",
      border: 0,
      cursor: "pointer",
      padding: "0 20px",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-sm)",
      fontWeight: 500,
      background: t.primaryBg,
      color: t.primaryText
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Search",
    size: 16
  }), "Search"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      go(mode === "client" ? "/jobs/new" : "/jobs");
    },
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      borderRadius: 999,
      padding: "10px 20px",
      fontSize: "var(--text-sm)",
      fontWeight: 500,
      textDecoration: "none",
      whiteSpace: "nowrap",
      background: t.primaryBg,
      color: t.primaryText
    }
  }, t.primaryLabel, /*#__PURE__*/React.createElement(Icon, {
    name: "ArrowRight",
    size: 16
  })), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      go(mode === "client" ? "/browse" : "/jobs");
    },
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      borderRadius: 999,
      border: "1px solid " + t.secondaryBorder,
      padding: "10px 20px",
      fontSize: "var(--text-sm)",
      fontWeight: 500,
      textDecoration: "none",
      whiteSpace: "nowrap",
      color: t.text
    }
  }, t.secondaryLabel))), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 24
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-xs)",
      fontWeight: 500,
      textTransform: "uppercase",
      letterSpacing: "var(--tracking-caps)",
      color: t.textMuted
    }
  }, t.rightLabel), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: "16px 0 0",
      padding: 0,
      listStyle: "none",
      display: "grid",
      gap: 2
    }
  }, D.categories.slice(0, 6).map(c => /*#__PURE__*/React.createElement("li", {
    key: c
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      go("/browse");
    },
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "1px solid " + t.badgeBorder,
      padding: "10px 0",
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-xl)",
      textDecoration: "none",
      color: t.text
    }
  }, c, /*#__PURE__*/React.createElement(Icon, {
    name: "ArrowRight",
    size: 16,
    color: t.textMuted
  }))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: "0 auto",
      maxWidth: "var(--page-max)",
      padding: "0 var(--gutter-md) 16px"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-xs)",
      fontWeight: 500,
      textTransform: "uppercase",
      letterSpacing: "var(--tracking-city)",
      color: t.cityText
    }
  }, "Blantyre \xB7 Lilongwe \xB7 Mzuzu"))), /*#__PURE__*/React.createElement("section", {
    style: {
      borderTop: "1px solid var(--gh-ink-10)",
      borderBottom: "1px solid var(--gh-ink-10)",
      background: "var(--surface-canvas)",
      padding: "80px 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      margin: "0 auto",
      maxWidth: "var(--page-max)",
      padding: "0 var(--gutter-md)"
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "gh-eyebrow",
    style: {
      margin: 0
    }
  }, "Why Ganyu Hub"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: "12px 0 0",
      maxWidth: "42rem",
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-3xl)",
      fontWeight: 600
    }
  }, "Hiring someone you found online should not be a leap of faith."), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: "40px 0 0",
      padding: 0,
      listStyle: "none",
      display: "grid",
      gridTemplateColumns: "repeat(4, minmax(0,1fr))",
      gap: "36px 40px"
    }
  }, VALUE_PROPS.map(v => /*#__PURE__*/React.createElement("li", {
    key: v.title
  }, /*#__PURE__*/React.createElement(Icon, {
    name: v.icon,
    size: 28,
    strokeWidth: 1.5,
    color: "var(--gh-teal)"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "12px 0 0",
      fontSize: "var(--text-base)",
      fontWeight: 600
    }
  }, v.title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "6px 0 0",
      fontSize: "var(--text-sm)",
      lineHeight: "var(--leading-relaxed)",
      color: "var(--gh-ink-70)",
      textWrap: "pretty"
    }
  }, v.body)))))), /*#__PURE__*/React.createElement("section", {
    style: {
      padding: "80px 0",
      background: "var(--surface-band)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      margin: "0 auto",
      maxWidth: "var(--page-max)",
      padding: "0 var(--gutter-md)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "gh-eyebrow",
    style: {
      margin: 0
    }
  }, "How it works"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: "12px 0 0",
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-3xl)",
      fontWeight: 600
    }
  }, "Four steps, and the money is never in the dark.")), /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    style: {
      display: "inline-flex",
      gap: 4,
      borderRadius: 999,
      background: "var(--gh-ink-05)",
      padding: 4
    }
  }, [["client", "I'm hiring"], ["creative", "I'm working"]].map(([m, l]) => /*#__PURE__*/React.createElement("button", {
    key: m,
    type: "button",
    onClick: () => setStepMode(m),
    "aria-selected": stepMode === m,
    style: {
      borderRadius: 999,
      border: 0,
      cursor: "pointer",
      padding: "6px 16px",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-sm)",
      fontWeight: 500,
      background: stepMode === m ? "var(--gh-teal)" : "transparent",
      color: stepMode === m ? "#fff" : "var(--gh-ink-70)",
      transition: "background-color var(--dur-control) var(--ease-out)"
    }
  }, l)))), /*#__PURE__*/React.createElement("ol", {
    style: {
      margin: "40px 0 0",
      padding: 0,
      listStyle: "none",
      display: "grid",
      gridTemplateColumns: "repeat(4, minmax(0,1fr))",
      gap: 16,
      counterReset: "s"
    }
  }, STEPS[stepMode].map(([title, body], i) => /*#__PURE__*/React.createElement("li", {
    key: title,
    style: {
      borderRadius: "var(--radius-inset)",
      background: "var(--gh-white)",
      border: "1px solid var(--border-card)",
      boxShadow: "var(--shadow-panel-soft)",
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      height: 28,
      width: 28,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 999,
      background: "var(--gh-teal-10)",
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-xs)",
      fontWeight: 600,
      color: "var(--gh-teal-dark)"
    }
  }, i + 1), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "12px 0 0",
      fontSize: "var(--text-base)",
      fontWeight: 600
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "6px 0 0",
      fontSize: "var(--text-sm)",
      lineHeight: "var(--leading-relaxed)",
      color: "var(--gh-ink-70)"
    }
  }, body)))))), /*#__PURE__*/React.createElement("section", {
    style: {
      padding: "80px 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      margin: "0 auto",
      maxWidth: "var(--page-max)",
      padding: "0 var(--gutter-md)",
      display: "grid",
      gap: 48
    }
  }, /*#__PURE__*/React.createElement(FeedCarousel, {
    eyebrow: "Available now",
    title: "Creatives taking work this week",
    seeAllHref: "#",
    count: D.creatives.length
  }, D.creatives.map(c => /*#__PURE__*/React.createElement(FeedCard, {
    key: c.name
  }, /*#__PURE__*/React.createElement(CreativeCard, _extends({}, c, {
    showSave: true
  }))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "gh-eyebrow",
    style: {
      margin: 0
    }
  }, "Open jobs"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: "4px 0 16px",
      fontSize: "var(--text-lg)",
      fontWeight: 600
    }
  }, "Work posted in the last week"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16
    }
  }, D.jobs.slice(0, 2).map(j => /*#__PURE__*/React.createElement(JobCard, _extends({
    key: j.id
  }, j, {
    showSave: true
  }))))))), /*#__PURE__*/React.createElement("section", {
    style: {
      padding: "0 0 80px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      margin: "0 auto",
      maxWidth: "var(--page-max)",
      padding: "0 var(--gutter-md)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: "var(--radius-card)",
      background: "var(--surface-inverse)",
      color: "var(--text-on-ink)",
      padding: "48px 40px",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-3xl)",
      fontWeight: 600,
      color: "var(--gh-ground)"
    }
  }, "Post a job. ", /*#__PURE__*/React.createElement("i", null, "Pay when it\u2019s right.")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "8px 0 0",
      maxWidth: "48ch",
      fontSize: "var(--text-sm)",
      color: "rgba(239,230,206,0.70)"
    }
  }, "It costs nothing to post, and nothing leaves your account until you have picked someone.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      go("/jobs/new");
    },
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      borderRadius: "var(--radius-control)",
      background: "var(--gh-teal)",
      padding: "12px 24px",
      fontSize: "var(--text-sm)",
      fontWeight: 500,
      color: "#fff",
      textDecoration: "none"
    }
  }, "Post a job", /*#__PURE__*/React.createElement(Icon, {
    name: "ArrowRight",
    size: 16,
    color: "#fff"
  })), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      go("/browse");
    },
    style: {
      display: "inline-flex",
      alignItems: "center",
      borderRadius: "var(--radius-control)",
      border: "1px solid rgba(239,230,206,0.20)",
      padding: "12px 24px",
      fontSize: "var(--text-sm)",
      fontWeight: 500,
      color: "var(--gh-ground)",
      textDecoration: "none"
    }
  }, "Browse creatives"))))));
}
Object.assign(window, {
  MarketingHome
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/MarketingHome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/WebShell.jsx
try { (() => {
/* Resolved at RENDER time, not module-eval time: the design-system bundle
   populates its namespace at the end of the bundle, so a top-level destructure
   here would capture undefined for every component. */
const DS = () => window.GanyuHubDesignSystem_1b2ec0;
function WebHeader({
  role,
  route,
  go,
  onRole
}) {
  const {
    Logo,
    PrimaryNav,
    CLIENT_NAV,
    CREATIVE_NAV,
    Icon,
    Input,
    Button
  } = DS();
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: "sticky",
      top: 0,
      zIndex: 30,
      background: "var(--surface-bar)",
      backdropFilter: "blur(8px)",
      borderBottom: "1px solid var(--border-hairline)",
      boxShadow: "var(--elev-2)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      margin: "0 auto",
      maxWidth: "var(--page-max)",
      display: "flex",
      alignItems: "center",
      gap: 24,
      padding: "12px var(--gutter-md)"
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      go("/");
    },
    style: {
      textDecoration: "none"
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    size: "md",
    markSrc: "../../assets/logo-g.png"
  })), /*#__PURE__*/React.createElement(PrimaryNav, {
    items: role === "client" ? CLIENT_NAV : CREATIVE_NAV,
    active: route,
    onNavigate: go
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto",
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onRole(role === "client" ? "creative" : "client"),
    style: {
      border: "1px solid var(--gh-ink-15)",
      background: "transparent",
      borderRadius: "var(--radius-pill)",
      padding: "5px 12px",
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "var(--gh-ink-60)",
      cursor: "pointer"
    }
  }, "viewing as ", role), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Bell",
    size: 20,
    color: "var(--gh-ink-65)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: -2,
      right: -3,
      height: 8,
      width: 8,
      borderRadius: 999,
      background: "var(--gh-teal)"
    }
  })), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    onClick: () => go("/jobs/new")
  }, "Post a job"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      height: 32,
      width: 32,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 999,
      background: "var(--gh-ink-85)",
      fontSize: "var(--text-11)",
      fontWeight: 600,
      color: "var(--gh-ground)"
    }
  }, "GP"))));
}
function WebFooter() {
  const {
    Logo,
    PrimaryNav,
    CLIENT_NAV,
    CREATIVE_NAV,
    Icon,
    Input,
    Button
  } = DS();
  const col = (title, items) => /*#__PURE__*/React.createElement("div", {
    key: title
  }, /*#__PURE__*/React.createElement("p", {
    className: "gh-eyebrow",
    style: {
      margin: 0
    }
  }, title), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: "12px 0 0",
      padding: 0,
      listStyle: "none",
      display: "grid",
      gap: 8
    }
  }, items.map(i => /*#__PURE__*/React.createElement("li", {
    key: i
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--gh-ink-70)",
      textDecoration: "none"
    }
  }, i)))));
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      borderTop: "1px solid var(--gh-ink-10)",
      background: "var(--surface-band)",
      padding: "48px 0 32px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      margin: "0 auto",
      maxWidth: "var(--page-max)",
      padding: "0 var(--gutter-md)",
      display: "grid",
      gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
      gap: 40
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Logo, {
    size: "sm",
    markSrc: "../../assets/logo-g.png"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "12px 0 0",
      maxWidth: "34ch",
      fontSize: "var(--text-sm)",
      lineHeight: "var(--leading-relaxed)",
      color: "var(--gh-ink-65)"
    }
  }, "Malawi\u2019s creative marketplace. Money held in escrow until the work is approved."), /*#__PURE__*/React.createElement("p", {
    className: "gh-eyebrow",
    style: {
      margin: "16px 0 0",
      letterSpacing: "var(--tracking-city)"
    }
  }, "Blantyre \xB7 Lilongwe \xB7 Mzuzu")), col("For clients", ["Post a job", "Browse creatives", "How the money works", "Report a problem"]), col("For creatives", ["Find work", "Build a portfolio", "Set your rates", "Get paid"]), col("Company", ["About", "Terms", "Privacy", "What's new"])));
}
Object.assign(window, {
  WebHeader,
  WebFooter
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/WebShell.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.CardHeader = __ds_scope.CardHeader;

__ds_ns.CardTitle = __ds_scope.CardTitle;

__ds_ns.CardDescription = __ds_scope.CardDescription;

__ds_ns.CardContent = __ds_scope.CardContent;

__ds_ns.CardFooter = __ds_scope.CardFooter;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Label = __ds_scope.Label;

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.CreativeCard = __ds_scope.CreativeCard;

__ds_ns.FeedCarousel = __ds_scope.FeedCarousel;

__ds_ns.FeedCard = __ds_scope.FeedCard;

__ds_ns.JobCard = __ds_scope.JobCard;

__ds_ns.ServiceCard = __ds_scope.ServiceCard;

__ds_ns.STAGES = __ds_scope.STAGES;

__ds_ns.JobProgressBar = __ds_scope.JobProgressBar;

__ds_ns.MoneyInput = __ds_scope.MoneyInput;

__ds_ns.MONEY_STATES = __ds_scope.MONEY_STATES;

__ds_ns.MoneyStamp = __ds_scope.MoneyStamp;

__ds_ns.PricingExplainer = __ds_scope.PricingExplainer;

__ds_ns.CLIENT_TABS = __ds_scope.CLIENT_TABS;

__ds_ns.CREATIVE_TABS = __ds_scope.CREATIVE_TABS;

__ds_ns.BottomTabBar = __ds_scope.BottomTabBar;

__ds_ns.NavDrawer = __ds_scope.NavDrawer;

__ds_ns.PageTabs = __ds_scope.PageTabs;

__ds_ns.CLIENT_NAV = __ds_scope.CLIENT_NAV;

__ds_ns.CREATIVE_NAV = __ds_scope.CREATIVE_NAV;

__ds_ns.PrimaryNav = __ds_scope.PrimaryNav;

__ds_ns.SearchScope = __ds_scope.SearchScope;

__ds_ns.StickyActionBar = __ds_scope.StickyActionBar;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.SaveButton = __ds_scope.SaveButton;

__ds_ns.StarRatingInput = __ds_scope.StarRatingInput;

__ds_ns.Stars = __ds_scope.Stars;

__ds_ns.STYLES = __ds_scope.STYLES;

__ds_ns.StyleSwatch = __ds_scope.StyleSwatch;

__ds_ns.StyleChoices = __ds_scope.StyleChoices;

__ds_ns.TagInput = __ds_scope.TagInput;

__ds_ns.VerifiedBadge = __ds_scope.VerifiedBadge;

})();
