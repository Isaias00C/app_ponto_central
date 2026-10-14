import { Alert, Platform } from 'react-native';

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
};

/**
 * Pede confirmacao antes de uma acao. `Alert.alert` nao faz nada no react-native-web,
 * entao na web usa o `window.confirm` do navegador.
 */
export function confirmAction({ title, message, confirmLabel, onConfirm }: ConfirmOptions) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }

  Alert.alert(title, message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: confirmLabel, onPress: onConfirm },
  ]);
}
