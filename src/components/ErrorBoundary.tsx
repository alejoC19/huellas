import { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, fontSizes, spacing } from '../theme';
import { Button } from './Button';
import { PawBadge } from './PawBadge';

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error no controlado:', error, info.componentStack);
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <PawBadge size={72} />
          <Text style={styles.title}>Algo salió mal</Text>
          <Text style={styles.message}>
            Encontramos un error inesperado. Podés intentar de nuevo.
          </Text>
          <Button label="Reintentar" onPress={this.reset} />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xxl,
    backgroundColor: colors.azulVereda,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: fontSizes.xl,
    color: colors.textOnDark,
  },
  message: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.sm,
    color: colors.textOnDarkMuted,
    textAlign: 'center',
  },
});
