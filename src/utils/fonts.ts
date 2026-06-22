import React from 'react';
import { Text, TextInput, StyleSheet } from 'react-native';

/**
 * React Native does NOT synthesize font weights from a single family — each
 * weight is its own font file. Rather than touch `fontFamily` in hundreds of
 * StyleSheet rules across every screen, we patch Text/TextInput once so any
 * `fontWeight` is mapped to the matching Sora file automatically.
 *
 * An explicitly-set non-Sora `fontFamily` (e.g. icon fonts like Ionicons) is
 * left untouched.
 */
const WEIGHT_TO_FAMILY: Record<string, string> = {
  '100':    'Sora_200ExtraLight',
  '200':    'Sora_200ExtraLight',
  '300':    'Sora_300Light',
  '400':    'Sora_400Regular',
  normal:   'Sora_400Regular',
  '500':    'Sora_500Medium',
  '600':    'Sora_600SemiBold',
  '700':    'Sora_700Bold',
  bold:     'Sora_700Bold',
  '800':    'Sora_800ExtraBold',
  '900':    'Sora_800ExtraBold',
};

let patched = false;

export function applySoraFont() {
  if (patched) return;
  patched = true;
  patchComponent(Text);
  patchComponent(TextInput);
}

function patchComponent(Component: any) {
  const original = Component.render;
  if (typeof original !== 'function') return;

  Component.render = function patchedRender(...args: any[]) {
    const element = original.apply(this, args);
    if (!element || !element.props) return element;

    const flat = StyleSheet.flatten(element.props.style) || {};
    const family = flat.fontFamily ? String(flat.fontFamily) : '';

    // Respect a deliberate non-Sora family (icon fonts, etc.)
    if (family && !family.startsWith('Sora_') && family !== 'System') {
      return element;
    }

    const weight = flat.fontWeight != null ? String(flat.fontWeight) : '400';
    const resolved = WEIGHT_TO_FAMILY[weight] || 'Sora_400Regular';

    // Our default goes first; the original style still wins for everything
    // except the (previously unset) fontFamily.
    return React.cloneElement(element, {
      style: [{ fontFamily: resolved }, element.props.style],
    });
  };
}
