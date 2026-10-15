type ConfirmOptions = {
  title: string;
  message: string;
  onConfirm: () => void;
};

/** Pede confirmacao (dialogo nativo do navegador) antes de uma acao. */
export function confirmAction({ title, message, onConfirm }: ConfirmOptions) {
  if (window.confirm(`${title}\n\n${message}`)) onConfirm();
}
