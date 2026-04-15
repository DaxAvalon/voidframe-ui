// Phase 14 — Bundled icon set
//
// Monoline 1px stroke, 24x24 viewBox, pixel-aligned. Every icon is a
// named export wrapping <Icon>. Directional icons mirror in RTL.
//
// This is the "core 50" staging ship; more can be drawn over time.

import { forwardRef } from "react";
import { Icon, type IconProps } from "./Icon";

type IconComp = React.ForwardRefExoticComponent<
  IconProps & React.RefAttributes<SVGSVGElement>
>;

function makeIcon(
  displayName: string,
  defaultLabel: string,
  glyph: React.ReactNode,
  options: { directional?: boolean } = {}
): IconComp {
  const Component = forwardRef<SVGSVGElement, IconProps>(function IconBase(
    { label, directional, ...props },
    ref
  ) {
    return (
      <Icon
        ref={ref}
        label={label ?? defaultLabel}
        directional={directional ?? options.directional}
        {...props}
      >
        {glyph}
      </Icon>
    );
  });
  Component.displayName = displayName;
  return Component;
}

// ── Actions ────────────────────────────────────────────────

export const PlusIcon = makeIcon(
  "PlusIcon",
  "Add",
  <>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </>
);

export const MinusIcon = makeIcon(
  "MinusIcon",
  "Remove",
  <path d="M5 12h14" />
);

export const CheckIcon = makeIcon(
  "CheckIcon",
  "Check",
  <path d="M4 12l5 5 11-11" />
);

export const XIcon = makeIcon(
  "XIcon",
  "Close",
  <>
    <path d="M5 5l14 14" />
    <path d="M19 5l-14 14" />
  </>
);

export const EditIcon = makeIcon(
  "EditIcon",
  "Edit",
  <>
    <path d="M4 20h4l11-11-4-4L4 16v4z" />
    <path d="M14 6l4 4" />
  </>
);

export const TrashIcon = makeIcon(
  "TrashIcon",
  "Delete",
  <>
    <path d="M4 7h16" />
    <path d="M9 7V4h6v3" />
    <path d="M6 7l1 13h10l1-13" />
  </>
);

export const CopyIcon = makeIcon(
  "CopyIcon",
  "Copy",
  <>
    <rect x="8" y="8" width="12" height="12" />
    <path d="M4 16V4h12" />
  </>
);

export const DownloadIcon = makeIcon(
  "DownloadIcon",
  "Download",
  <>
    <path d="M12 4v12" />
    <path d="M6 10l6 6 6-6" />
    <path d="M4 20h16" />
  </>
);

export const UploadIcon = makeIcon(
  "UploadIcon",
  "Upload",
  <>
    <path d="M12 20V8" />
    <path d="M6 14l6-6 6 6" />
    <path d="M4 4h16" />
  </>
);

export const RefreshIcon = makeIcon(
  "RefreshIcon",
  "Refresh",
  <>
    <path d="M4 12a8 8 0 0 1 14-5l2-2" />
    <path d="M20 4v4h-4" />
    <path d="M20 12a8 8 0 0 1-14 5l-2 2" />
    <path d="M4 20v-4h4" />
  </>
);

export const SaveIcon = makeIcon(
  "SaveIcon",
  "Save",
  <>
    <path d="M4 4h12l4 4v12H4z" />
    <path d="M8 4v6h8V4" />
    <path d="M8 20v-6h8v6" />
  </>
);

export const ShareIcon = makeIcon(
  "ShareIcon",
  "Share",
  <>
    <circle cx="6" cy="12" r="2" />
    <circle cx="18" cy="6" r="2" />
    <circle cx="18" cy="18" r="2" />
    <path d="M8 11l8-4" />
    <path d="M8 13l8 4" />
  </>
);

export const SendIcon = makeIcon(
  "SendIcon",
  "Send",
  <>
    <path d="M4 20l16-8L4 4l0 7 10 1-10 1z" />
  </>,
  { directional: true }
);

export const BookmarkIcon = makeIcon(
  "BookmarkIcon",
  "Bookmark",
  <path d="M6 4h12v16l-6-4-6 4z" />
);

export const PinIcon = makeIcon(
  "PinIcon",
  "Pin",
  <>
    <path d="M14 4l6 6-5 2-5 5-3-3 5-5 2-5z" />
    <path d="M9 15l-5 5" />
  </>
);

// ── Navigation ─────────────────────────────────────────────

export const ChevronUpIcon = makeIcon(
  "ChevronUpIcon",
  "Expand",
  <path d="M6 15l6-6 6 6" />
);

export const ChevronDownIcon = makeIcon(
  "ChevronDownIcon",
  "Collapse",
  <path d="M6 9l6 6 6-6" />
);

export const ChevronLeftIcon = makeIcon(
  "ChevronLeftIcon",
  "Previous",
  <path d="M15 6l-6 6 6 6" />,
  { directional: true }
);

export const ChevronRightIcon = makeIcon(
  "ChevronRightIcon",
  "Next",
  <path d="M9 6l6 6-6 6" />,
  { directional: true }
);

export const ArrowUpIcon = makeIcon(
  "ArrowUpIcon",
  "Up",
  <>
    <path d="M12 4v16" />
    <path d="M5 11l7-7 7 7" />
  </>
);

export const ArrowDownIcon = makeIcon(
  "ArrowDownIcon",
  "Down",
  <>
    <path d="M12 4v16" />
    <path d="M5 13l7 7 7-7" />
  </>
);

export const ArrowLeftIcon = makeIcon(
  "ArrowLeftIcon",
  "Back",
  <>
    <path d="M4 12h16" />
    <path d="M11 5l-7 7 7 7" />
  </>,
  { directional: true }
);

export const ArrowRightIcon = makeIcon(
  "ArrowRightIcon",
  "Forward",
  <>
    <path d="M4 12h16" />
    <path d="M13 5l7 7-7 7" />
  </>,
  { directional: true }
);

export const HomeIcon = makeIcon(
  "HomeIcon",
  "Home",
  <>
    <path d="M4 11l8-7 8 7" />
    <path d="M6 10v10h12V10" />
    <path d="M10 20v-6h4v6" />
  </>
);

export const ExternalLinkIcon = makeIcon(
  "ExternalLinkIcon",
  "Open in new tab",
  <>
    <path d="M10 4h-6v16h16v-6" />
    <path d="M14 4h6v6" />
    <path d="M20 4l-10 10" />
  </>
);

export const MoreHorizontalIcon = makeIcon(
  "MoreHorizontalIcon",
  "More",
  <>
    <circle cx="6" cy="12" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="18" cy="12" r="1" />
  </>
);

export const MoreVerticalIcon = makeIcon(
  "MoreVerticalIcon",
  "More",
  <>
    <circle cx="12" cy="6" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="18" r="1" />
  </>
);

export const MenuIcon = makeIcon(
  "MenuIcon",
  "Menu",
  <>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  </>
);

// ── Files ──────────────────────────────────────────────────

export const FileIcon = makeIcon(
  "FileIcon",
  "File",
  <>
    <path d="M6 3h9l5 5v13H6z" />
    <path d="M15 3v5h5" />
  </>
);

export const FileTextIcon = makeIcon(
  "FileTextIcon",
  "Document",
  <>
    <path d="M6 3h9l5 5v13H6z" />
    <path d="M15 3v5h5" />
    <path d="M9 13h8" />
    <path d="M9 17h8" />
  </>
);

export const FolderIcon = makeIcon(
  "FolderIcon",
  "Folder",
  <path d="M4 6h6l2 3h8v10H4z" />
);

export const FolderOpenIcon = makeIcon(
  "FolderOpenIcon",
  "Open folder",
  <>
    <path d="M4 6h6l2 3h8v2H4z" />
    <path d="M4 11h18l-2 8H4z" />
  </>
);

// ── Editors ────────────────────────────────────────────────

export const BoldIcon = makeIcon(
  "BoldIcon",
  "Bold",
  <>
    <path d="M6 4h6a4 4 0 0 1 0 8H6z" />
    <path d="M6 12h7a4 4 0 0 1 0 8H6z" />
  </>
);

export const ItalicIcon = makeIcon(
  "ItalicIcon",
  "Italic",
  <>
    <path d="M10 4h8" />
    <path d="M6 20h8" />
    <path d="M14 4l-4 16" />
  </>
);

export const UnderlineIcon = makeIcon(
  "UnderlineIcon",
  "Underline",
  <>
    <path d="M6 4v8a6 6 0 0 0 12 0V4" />
    <path d="M4 20h16" />
  </>
);

export const CodeIcon = makeIcon(
  "CodeIcon",
  "Code",
  <>
    <path d="M9 7l-5 5 5 5" />
    <path d="M15 7l5 5-5 5" />
  </>
);

export const QuoteIcon = makeIcon(
  "QuoteIcon",
  "Quote",
  <>
    <path d="M5 17h3l2-4V7H4v6h3" />
    <path d="M14 17h3l2-4V7h-6v6h3" />
  </>
);

export const LinkIcon = makeIcon(
  "LinkIcon",
  "Link",
  <>
    <path d="M10 14a4 4 0 0 0 0 6l3-3a4 4 0 0 0-6-6" />
    <path d="M14 10a4 4 0 0 0 0-6l-3 3a4 4 0 0 0 6 6" />
  </>
);

// ── Status ─────────────────────────────────────────────────

export const InfoIcon = makeIcon(
  "InfoIcon",
  "Information",
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v6" />
    <path d="M12 7v2" />
  </>
);

export const WarningIcon = makeIcon(
  "WarningIcon",
  "Warning",
  <>
    <path d="M12 3l10 17H2z" />
    <path d="M12 10v5" />
    <path d="M12 17v2" />
  </>
);

export const ErrorIcon = makeIcon(
  "ErrorIcon",
  "Error",
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 8l8 8" />
    <path d="M16 8l-8 8" />
  </>
);

export const SuccessIcon = makeIcon(
  "SuccessIcon",
  "Success",
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12l3 3 5-6" />
  </>
);

export const QuestionIcon = makeIcon(
  "QuestionIcon",
  "Help",
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M9 9a3 3 0 1 1 5 2l-2 2v2" />
    <circle cx="12" cy="18" r="0.5" />
  </>
);

export const SpinnerIcon = makeIcon(
  "SpinnerIcon",
  "Loading",
  <>
    <circle cx="12" cy="12" r="9" opacity="0.25" />
    <path d="M12 3a9 9 0 0 1 9 9" />
  </>
);

// ── Shapes ─────────────────────────────────────────────────

export const CircleIcon = makeIcon(
  "CircleIcon",
  "Circle",
  <circle cx="12" cy="12" r="9" />
);

export const SquareIcon = makeIcon(
  "SquareIcon",
  "Square",
  <rect x="4" y="4" width="16" height="16" />
);

export const StarIcon = makeIcon(
  "StarIcon",
  "Star",
  <path d="M12 3l3 6 6 1-4 5 1 6-6-3-6 3 1-6-4-5 6-1z" />
);

export const HeartIcon = makeIcon(
  "HeartIcon",
  "Favorite",
  <path d="M12 20s-8-4-8-11a5 5 0 0 1 8-4 5 5 0 0 1 8 4c0 7-8 11-8 11z" />
);

// ── System ────────────────────────────────────────────────

export const SettingsIcon = makeIcon(
  "SettingsIcon",
  "Settings",
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2l2 3-2 2-2-2z" />
    <path d="M12 22l-2-3 2-2 2 2z" />
    <path d="M2 12l3 2 2-2-2-2z" />
    <path d="M22 12l-3-2-2 2 2 2z" />
  </>
);

export const UserIcon = makeIcon(
  "UserIcon",
  "User",
  <>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20a8 8 0 0 1 16 0" />
  </>
);

export const UsersIcon = makeIcon(
  "UsersIcon",
  "Users",
  <>
    <circle cx="9" cy="8" r="4" />
    <path d="M2 20a7 7 0 0 1 14 0" />
    <path d="M16 6a4 4 0 0 1 0 8" />
    <path d="M18 20a5 5 0 0 0-2-4" />
  </>
);

export const LockIcon = makeIcon(
  "LockIcon",
  "Lock",
  <>
    <rect x="5" y="11" width="14" height="10" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </>
);

export const UnlockIcon = makeIcon(
  "UnlockIcon",
  "Unlock",
  <>
    <rect x="5" y="11" width="14" height="10" />
    <path d="M8 11V7a4 4 0 0 1 7-2" />
  </>
);

export const EyeIcon = makeIcon(
  "EyeIcon",
  "Show",
  <>
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </>
);

export const EyeOffIcon = makeIcon(
  "EyeOffIcon",
  "Hide",
  <>
    <path d="M3 3l18 18" />
    <path d="M10.5 6.2A11 11 0 0 1 12 6c6 0 10 6 10 6a18 18 0 0 1-3 3.7" />
    <path d="M6 8a18 18 0 0 0-4 4s4 6 10 6c1.5 0 2.9-.3 4-.8" />
  </>
);

export const SearchIcon = makeIcon(
  "SearchIcon",
  "Search",
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-4-4" />
  </>
);

export const FilterIcon = makeIcon(
  "FilterIcon",
  "Filter",
  <path d="M4 5h16l-6 8v6l-4-2v-4z" />
);

export const SortIcon = makeIcon(
  "SortIcon",
  "Sort",
  <>
    <path d="M6 4v16" />
    <path d="M3 7l3-3 3 3" />
    <path d="M18 4v16" />
    <path d="M15 17l3 3 3-3" />
  </>
);

// ── Communication ──────────────────────────────────────────

export const MailIcon = makeIcon(
  "MailIcon",
  "Mail",
  <>
    <rect x="3" y="5" width="18" height="14" />
    <path d="M3 6l9 7 9-7" />
  </>
);

export const BellIcon = makeIcon(
  "BellIcon",
  "Notifications",
  <>
    <path d="M6 15V10a6 6 0 0 1 12 0v5l2 3H4z" />
    <path d="M10 21a2 2 0 0 0 4 0" />
  </>
);

export const MessageIcon = makeIcon(
  "MessageIcon",
  "Message",
  <path d="M4 4h16v12H8l-4 4z" />
);

// ── Media ─────────────────────────────────────────────────

export const PlayIcon = makeIcon(
  "PlayIcon",
  "Play",
  <path d="M6 4l14 8-14 8z" />,
  { directional: true }
);

export const PauseIcon = makeIcon(
  "PauseIcon",
  "Pause",
  <>
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </>
);

export const StopIcon = makeIcon(
  "StopIcon",
  "Stop",
  <rect x="6" y="6" width="12" height="12" />
);

// ── Time ──────────────────────────────────────────────────

export const ClockIcon = makeIcon(
  "ClockIcon",
  "Clock",
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </>
);

export const CalendarIcon = makeIcon(
  "CalendarIcon",
  "Calendar",
  <>
    <rect x="4" y="6" width="16" height="14" />
    <path d="M4 10h16" />
    <path d="M9 4v4" />
    <path d="M15 4v4" />
  </>
);

export const SunIcon = makeIcon(
  "SunIcon",
  "Light theme",
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v3" />
    <path d="M12 19v3" />
    <path d="M2 12h3" />
    <path d="M19 12h3" />
    <path d="M5 5l2 2" />
    <path d="M17 17l2 2" />
    <path d="M5 19l2-2" />
    <path d="M17 7l2-2" />
  </>
);

export const MoonIcon = makeIcon(
  "MoonIcon",
  "Dark theme",
  <path d="M20 14A8 8 0 1 1 10 4a7 7 0 0 0 10 10z" />
);

// ── Data ──────────────────────────────────────────────────

export const ChartBarIcon = makeIcon(
  "ChartBarIcon",
  "Bar chart",
  <>
    <path d="M4 20V10" />
    <path d="M10 20V4" />
    <path d="M16 20v-8" />
    <path d="M22 20H2" />
  </>
);

export const ChartLineIcon = makeIcon(
  "ChartLineIcon",
  "Line chart",
  <>
    <path d="M3 17l5-5 4 4 9-9" />
    <path d="M3 20h18" />
  </>
);

export const DatabaseIcon = makeIcon(
  "DatabaseIcon",
  "Database",
  <>
    <ellipse cx="12" cy="5" rx="8" ry="3" />
    <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
    <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
  </>
);

export const TerminalIcon = makeIcon(
  "TerminalIcon",
  "Terminal",
  <>
    <rect x="3" y="4" width="18" height="16" />
    <path d="M7 9l3 3-3 3" />
    <path d="M13 15h4" />
  </>
);

export const CloudIcon = makeIcon(
  "CloudIcon",
  "Cloud",
  <path d="M7 18h10a4 4 0 0 0 0-8 5 5 0 0 0-10 1 4 4 0 0 0 0 7z" />
);

// ── Caret (directional, flips on expand) ──────────────────

export const CaretIcon = makeIcon(
  "CaretIcon",
  "Toggle",
  <path d="M8 9l4 4 4-4" />
);

// ── Loading ───────────────────────────────────────────────

export const LoadingDotsIcon = makeIcon(
  "LoadingDotsIcon",
  "Loading",
  <>
    <circle cx="5" cy="12" r="2">
      <animate
        attributeName="opacity"
        values="0.3;1;0.3"
        dur="1s"
        repeatCount="indefinite"
      />
    </circle>
    <circle cx="12" cy="12" r="2">
      <animate
        attributeName="opacity"
        values="0.3;1;0.3"
        dur="1s"
        begin="0.15s"
        repeatCount="indefinite"
      />
    </circle>
    <circle cx="19" cy="12" r="2">
      <animate
        attributeName="opacity"
        values="0.3;1;0.3"
        dur="1s"
        begin="0.3s"
        repeatCount="indefinite"
      />
    </circle>
  </>
);
