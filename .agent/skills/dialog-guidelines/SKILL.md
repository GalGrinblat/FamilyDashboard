---
description: Design guidelines and best practices for creating Dialogs in the FamilyDashboard application.
---

# Dialog Guidelines

When creating or modifying Dialog components in the FamilyDashboard platform, adhere to the following styling and structure rules to ensure consistency:

## 1. Grid Overlays & Implicit Layout Bugs
- **Forms as Grids:** Dialog forms generally use `<form className="grid gap-4 py-4">`. This establishes a single-column grid.
- **Children Structure:** Form fields are typically structured as `grid grid-cols-4`:
  ```tsx
  <div className="grid grid-cols-4 items-start gap-4">
    <Label className="text-right pt-2">Name</Label>
    <Input className="col-span-3" />
  </div>
  ```
- **Avoid top-level `col-span-`:** **NEVER** place a `<div className="col-span-X">` directly as a child of the top-level form (`<form className="grid ...">`) without defining columns on the form itself. Doing so forces CSS Grid to implicitly generate columns for the entire form, which causes preceding form groups to squish horizontally side-by-side.

## 2. Dialog Trigger Buttons
Make sure the main action buttons that open these dialogs have a consistent visual footprint.
- **Creation Mode:** Use the `default` button variant (black background) and standard sizing.
- **Edit Mode:** Use the `ghost` variant and `icon` size to display just a pencil icon without heavy borders.
- **Pattern:**
  ```tsx
  <Button variant={isEditing ? 'ghost' : 'default'} size={isEditing ? 'icon' : 'default'}>
    {isEditing ? (
      <Pencil className="h-4 w-4" />
    ) : (
      <>
        <Plus className="mr-2 h-4 w-4" /> הוסף פריט
      </>
    )}
  </Button>
  ```
Do NOT use `variant="outline"` for primary "Add" or "Create" action triggers.
