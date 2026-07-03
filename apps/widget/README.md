# NombaLens Checkout Widget

This package builds a self-contained embeddable widget bundle at `dist/widget.js`.

## Build

```bash
cd apps/widget
pnpm install
pnpm run build
```

## Local development

```bash
pnpm run dev
```

## Embed example

Use the generated bundle and initialize the widget from your merchant page.

```html
<script src="/path/to/dist/widget.js"></script>
<script>
  window.NombaLens?.init({
    merchantId: "your-merchant-id",
    apiUrl: "https://your-backend.example.com",
    customerId: "optional-customer-id",
    timeout: 3000,
    debug: true,
  });
</script>
```

`window.NombaLens.init` will fetch suggestions and reorder checkout payment methods when the page is ready.
