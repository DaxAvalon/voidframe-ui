"use client";

// Flat re-exports for shadcn primitives that map 1:1 to voidframe with
// no shape change. Grouped here to keep the compat layer light — one
// module per "interesting" primitive (Dialog, Tabs, Select, etc.) and
// this single module for the trivial passthroughs.

export { Input } from "../../components/Form";
export { Textarea } from "../../components/Form";
export { Label } from "../../components/Text";
export { Badge } from "../../components/Badge";
export { Checkbox } from "../../components/FormExtended";
export { Switch } from "../../components/FormAdvanced";
export { Avatar } from "../../components/DataExtended";
export { Separator } from "../../primitives";
export { ScrollArea } from "../../components/ScrollArea";
export { Skeleton } from "../../components/DataExtended";
export { Progress } from "../../components/Data";
export { Slider } from "../../components/FormExtended";
export { Toggle } from "../../components/Form";
export { ToggleGroup } from "../../components/ToggleGroup";

// shadcn's RadioGroup compound: voidframe ships `RadioGroup` (single
// component with options array) plus standalone `Radio`. Re-export both
// so consumers can pick.
export { RadioGroup } from "../../components/FormExtended";
export { Radio as RadioGroupItem } from "../../components/FormExtended";
