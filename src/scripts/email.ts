// Turns "user [at] domain [dot] com" into a mailto link and wires the
// "Copy email" button. Without JS the bracketed text stays and the button
// stays hidden.

const decode = (text: string) => text.trim().replace(' [at] ', '@').replaceAll(' [dot] ', '.');

export function initEmail() {
  const spans = [...document.querySelectorAll<HTMLElement>('[data-email]')];
  if (!spans.length || spans[0].querySelector('a')) return; // already done
  const address = decode(spans[0].textContent ?? '');

  for (const span of spans) {
    const link = document.createElement('a');
    link.href = `mailto:${address}`;
    link.textContent = address;
    span.replaceChildren(link);
  }

  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-copy-email]')) {
    const status = button.parentElement?.querySelector<HTMLElement>('[data-copy-status]');
    let timer: number | undefined;
    button.hidden = false;
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(address);
      } catch {
        // No clipboard access: select the address so it can be copied by hand.
        const link = spans[0].querySelector('a');
        if (link) window.getSelection()?.selectAllChildren(link);
        return;
      }
      if (!status) return;
      status.textContent = 'Copied';
      window.clearTimeout(timer);
      timer = window.setTimeout(() => (status.textContent = ''), 4000);
    });
  }
}
