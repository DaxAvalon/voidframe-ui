"use client";

// shadcn-shaped DropdownMenu — flat named exports backed by voidframe's
// `Menu.*` compound. shadcn's API names → voidframe's:
//
//   DropdownMenu          → Menu (root)
//   DropdownMenuTrigger   → Menu.Trigger
//   DropdownMenuContent   → Menu.Content
//   DropdownMenuItem      → Menu.Item
//   DropdownMenuCheckboxItem  → Menu.CheckboxItem
//   DropdownMenuRadioGroup    → Menu.RadioGroup
//   DropdownMenuRadioItem     → Menu.RadioItem
//   DropdownMenuSeparator     → Menu.Separator
//   DropdownMenuLabel         → Menu.Label
//   DropdownMenuSub           → Menu.Sub
//   DropdownMenuSubTrigger    → Menu.SubTrigger
//   DropdownMenuSubContent    → Menu.SubContent

import {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuLabel,
  MenuSub,
  MenuSubTrigger,
  MenuSubContent,
} from "../../components/Menu";

export const DropdownMenu = Menu;
export const DropdownMenuTrigger = MenuTrigger;
export const DropdownMenuContent = MenuContent;
export const DropdownMenuItem = MenuItem;
export const DropdownMenuCheckboxItem = MenuCheckboxItem;
export const DropdownMenuRadioGroup = MenuRadioGroup;
export const DropdownMenuRadioItem = MenuRadioItem;
export const DropdownMenuSeparator = MenuSeparator;
export const DropdownMenuLabel = MenuLabel;
export const DropdownMenuSub = MenuSub;
export const DropdownMenuSubTrigger = MenuSubTrigger;
export const DropdownMenuSubContent = MenuSubContent;
