import { Accordion } from "voidframe-ui";

export default function AccordionRoute() {
  return (
    <>
      <Accordion type="single" collapsible defaultValue="a">
        <Accordion.Item value="a">
          <Accordion.Trigger data-testid="trigger-a">Section A</Accordion.Trigger>
          <Accordion.Content data-testid="content-a">
            Body A
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="b">
          <Accordion.Trigger data-testid="trigger-b">Section B</Accordion.Trigger>
          <Accordion.Content data-testid="content-b">
            Body B
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="c">
          <Accordion.Trigger data-testid="trigger-c">Section C</Accordion.Trigger>
          <Accordion.Content data-testid="content-c">
            Body C
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
      <button data-testid="outside">outside</button>
    </>
  );
}
