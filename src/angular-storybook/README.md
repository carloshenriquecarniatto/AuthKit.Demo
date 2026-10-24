# AuthKit Storybook — Angular

The Angular child of the unified Storybook at `/storybook/`, served at `/storybook/angular/`.

The stories do **not** use the `@storybook/angular` renderer. That renderer mounts a wrapper and,
with a custom template, did not re-apply arguments to the component: the controls looked live and
changed nothing. Instead, the Angular gallery exposes a story mode:

```text
/angular/?story=email&prefilledEmail=ada@example.com&showForgotPassword=false&…
```

`App` renders one real component with the gallery's providers and no shell. The stories embed that
page and turn their controls into query parameters, so every change reloads the frame and runs the
same code as the gallery.

```bash
npm ci
npm run storybook   # port 6007, points at the demo on :5080
npm run build       # -> storybook-static/
```

The demo host must be running; without it the iframe has nothing to load.
