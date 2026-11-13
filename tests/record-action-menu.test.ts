import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import * as jsx from "react/jsx-runtime";

type Element = { type: unknown; props: Record<string, unknown> };
type HandlerEvent = {
  key?: string;
  preventDefault: () => void;
  currentTarget: unknown;
  relatedTarget?: unknown;
};

type FieldFixture = {
  tag: "input" | "textarea" | "select";
  type?: string;
  disabled?: boolean;
  readOnly?: boolean;
  insideForm?: boolean;
  name: string;
};

function fixture(
  fields: FieldFixture[] = [
    { tag: "textarea", insideForm: false, name: "editable-field" },
  ],
) {
  const listeners = new Map<string, (event: { target: object }) => void>();
  let focus = "",
    scrolled = "",
    targetId = "";
  class Node {}
  const trigger = {
    focus: () => {
      focus = "trigger";
    },
    scrollIntoView: () => {
      scrolled = "trigger";
    },
  };
  const controls = fields.map((field) => ({
    ...field,
    focus: () => {
      if (!field.disabled) focus = field.name;
    },
    scrollIntoView: () => {
      scrolled = field.name;
    },
  }));
  class Details extends Node {
    open = false;
    contains(value: unknown) {
      return value === this;
    }
    removeAttribute(name: string) {
      if (name === "open") this.open = false;
    }
    querySelector(selector: string) {
      if (selector === "summary") return trigger;
      // This deliberately models the real unwrapped application textarea.
      // A selector constrained to `form` cannot match a control in its div.
      // Unknown selectors fail instead of making every query find a field.
      const clauses = selector.split(",").map((part) => part.trim());
      for (const clause of clauses) {
        assert.match(
          clause,
          /^(?:form )?(?:textarea|input|select)(?::enabled|:not\((?::disabled|\[(?:readonly|type="[a-z]+")\])\))*$/,
        );
      }
      return (
        controls.find((field) =>
          clauses.some((clause) => {
            if (clause.startsWith("form ") && !field.insideForm) return false;
            if (!new RegExp(`^(?:form )?${field.tag}(?=:|$)`).test(clause))
              return false;
            if (
              (clause.includes(":enabled") ||
                clause.includes(":not(:disabled)")) &&
              field.disabled
            )
              return false;
            if (clause.includes(":not([readonly])") && field.readOnly)
              return false;
            const excludedTypes = [
              ...clause.matchAll(/:not\(\[type="([a-z]+)"\]\)/g),
            ].map((match) => match[1]);
            return !excludedTypes.includes(field.type ?? "text");
          }),
        ) ?? null
      );
    }
  }
  const record = new Details(),
    menu = new Details();
  const container = {
    exports: {} as {
      RecordActionMenu: (props: {
        label: string;
        children: unknown;
      }) => Element;
      RecordDetailsAction: (props: {
        targetId: string;
        edit?: boolean;
      }) => Element;
    },
  };
  vm.runInNewContext(
    ts.transpileModule(
      readFileSync("components/admin/record-action-menu.tsx", "utf8"),
      {
        compilerOptions: {
          jsx: ts.JsxEmit.ReactJSX,
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
        },
      },
    ).outputText,
    {
      exports: container.exports,
      module: container,
      Node,
      HTMLDetailsElement: Details,
      document: {
        addEventListener: (
          name: string,
          handler: (event: { target: object }) => void,
        ) => listeners.set(name, handler),
        removeEventListener: (name: string) => listeners.delete(name),
        getElementById: (id: string) => {
          targetId = id;
          return id === "synthetic-record" ? record : null;
        },
      },
      require: (name: string) => {
        if (name === "react/jsx-runtime") return jsx;
        if (name === "react")
          return {
            useRef: () => ({ current: menu }),
            useEffect: (effect: () => unknown) => effect(),
          };
        throw new Error("Unexpected dependency " + name);
      },
    },
  );
  return {
    ...container.exports,
    record,
    menu,
    listeners,
    Node,
    result: () => ({ focus, scrolled, targetId }),
  };
}

test("record actions use a closed native disclosure with contextual name and preserve ordinary keyboard controls", () => {
  const f = fixture();
  const node = f.RecordActionMenu({
    label: "Synthetic Record",
    children: "existing confirmed action",
  });
  assert.equal(node.type, "details");
  assert.equal(node.props.open, undefined);
  assert.equal(
    node.props.role,
    undefined,
    "No incomplete ARIA menu keyboard contract",
  );
  const children = node.props.children as Element[];
  assert.equal(children[0].type, "summary");
  assert.equal(
    children[0].props["aria-label"],
    "More actions for Synthetic Record",
  );
  assert.equal(children[1].props.role, "group");
  assert.equal(children[1].props.children, "existing confirmed action");
});

test("Escape closes the action disclosure and restores trigger focus; outside interaction closes it", () => {
  const f = fixture(),
    node = f.RecordActionMenu({ label: "Synthetic", children: null });
  f.menu.open = true;
  let prevented = false;
  (node.props.onKeyDown as (event: HandlerEvent) => void)({
    key: "Escape",
    preventDefault: () => {
      prevented = true;
    },
    currentTarget: f.menu,
  });
  assert.equal(prevented, true);
  assert.equal(f.menu.open, false);
  assert.equal(f.result().focus, "trigger");
  f.menu.open = true;
  f.listeners.get("pointerdown")?.({ target: new f.Node() });
  assert.equal(f.menu.open, false);
  f.menu.open = true;
  (node.props.onBlur as (event: HandlerEvent) => void)({
    preventDefault() {},
    currentTarget: f.menu,
    relatedTarget: new f.Node(),
  });
  assert.equal(f.menu.open, false);
});

test("View and Edit open only their matching record and focus existing controls without submitting", () => {
  for (const edit of [false, true]) {
    const f = fixture(),
      node = f.RecordDetailsAction({ targetId: "synthetic-record", edit });
    assert.equal(
      node.props.type,
      "button",
      "Menu navigation must never submit a surrounding form",
    );
    assert.equal(node.props.children, edit ? "Edit" : "View details");
    f.menu.open = true;
    (node.props.onClick as (event: HandlerEvent) => void)({
      preventDefault() {},
      currentTarget: { closest: () => f.menu },
    });
    assert.equal(f.record.open, true);
    assert.equal(f.menu.open, false);
    assert.deepEqual(f.result(), {
      targetId: "synthetic-record",
      focus: edit ? "editable-field" : "trigger",
      scrolled: edit ? "editable-field" : "trigger",
    });
  }
});

test("a stale record action cannot navigate to or operate on an unrelated record", () => {
  const f = fixture(),
    node = f.RecordDetailsAction({ targetId: "removed-record", edit: true });
  (node.props.onClick as (event: HandlerEvent) => void)({
    preventDefault() {},
    currentTarget: { closest: () => f.menu },
  });
  assert.equal(f.record.open, false);
  assert.equal(f.result().focus, "");
});

test("Edit focuses the application review textarea without requiring a form wrapper", () => {
  const f = fixture([
    { tag: "textarea", insideForm: false, name: "application-notes" },
  ]);
  const node = f.RecordDetailsAction({
    targetId: "synthetic-record",
    edit: true,
  });
  (node.props.onClick as (event: HandlerEvent) => void)({
    preventDefault() {},
    currentTarget: { closest: () => f.menu },
  });
  assert.equal(f.record.open, true);
  assert.equal(f.result().focus, "application-notes");
});

test("Edit skips hidden, disabled, readonly and submit controls, including disabled fieldset controls", () => {
  const f = fixture([
    {
      tag: "input",
      type: "hidden",
      name: "private-record-id",
      insideForm: true,
    },
    {
      tag: "textarea",
      disabled: true,
      name: "disabled-notes",
      insideForm: true,
    },
    {
      tag: "input",
      readOnly: true,
      name: "readonly-contact",
      insideForm: true,
    },
    { tag: "input", type: "submit", name: "submit-record", insideForm: true },
    {
      tag: "select",
      disabled: true,
      name: "disabled-fieldset-status",
      insideForm: true,
    },
    { tag: "select", name: "editable-status", insideForm: false },
  ]);
  const node = f.RecordDetailsAction({
    targetId: "synthetic-record",
    edit: true,
  });
  (node.props.onClick as (event: HandlerEvent) => void)({
    preventDefault() {},
    currentTarget: { closest: () => f.menu },
  });
  assert.equal(f.result().focus, "editable-status");
});

test("Edit safely falls back to the record summary when no editable control is enabled", () => {
  const f = fixture([
    { tag: "textarea", disabled: true, name: "disabled-notes" },
  ]);
  const node = f.RecordDetailsAction({
    targetId: "synthetic-record",
    edit: true,
  });
  (node.props.onClick as (event: HandlerEvent) => void)({
    preventDefault() {},
    currentTarget: { closest: () => f.menu },
  });
  assert.equal(f.record.open, true);
  assert.equal(f.result().focus, "trigger");
});
