# ProofGate widget

Public, auditable client script for the ProofGate payment button. The server backend is closed source and lives in the private `proofgate` repository.

Live service: https://proofgate.proofgate.workers.dev

## Usage

```html
<script src="https://proofgate.proofgate.workers.dev/embed.js"
  data-to="TM2deFM4byG1rVvhA15fTJD7gLaE9xvSid"
  data-amount="19.00"
  data-variant="auto"
  data-accent="#0F5132"
  data-label="Pay with USDT"></script>
```

Attributes: `data-to`, `data-amount`, `data-variant` (`auto`, `solid`, `dark`, `outline`), `data-accent`, `data-label`, `data-theme`.

`auto` detects the host page background and selects a solid or dark button. See `examples/index.html` for a minimal page.

Report abuse or vulnerabilities via GitHub Issues in this repository.
