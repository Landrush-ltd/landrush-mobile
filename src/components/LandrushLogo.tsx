/**
 * LandrushLogo — React Native component
 *
 * Recreates the brand logo using pure View/Text primitives (no SVG lib needed).
 *
 * Props:
 *   size      — icon cell size in dp (default 40). Total icon = size*2 + gap.
 *   showText  — whether to show LAND / RUSH wordmark (default true)
 *   style     — optional ViewStyle for the outer container
 */
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../constants/theme';

const DARK = '#1A5E3A';
const LIME = Colors.lime; // #9FBB44

interface Props {
  size?: number;
  showText?: boolean;
  style?: ViewStyle;
  /** Override the LAND/RUSH wordmark color (defaults to brand lime). */
  textColor?: string;
  /** Animated handles supplied by callers (e.g. splash). Currently decorative. */
  animated?: Record<string, unknown>;
}

export function LandrushLogo({ size = 40, showText = true, style, textColor }: Props) {
  const gap        = Math.round(size * 0.14);   // gap between cells
  const r          = Math.round(size * 0.22);   // cell border radius
  const concaveR   = Math.round(size * 0.5);    // concave punch-out radius
  const fontSize   = Math.round(size * 1.05);   // wordmark font size
  const iconSize   = size * 2 + gap;            // total icon dimension

  return (
    <View style={[styles.root, style]}>
      {/* ── 2×2 Grid Icon ───────────────────────────────────── */}
      <View style={{ width: iconSize, height: iconSize }}>

        {/* Top row */}
        <View style={[styles.row, { gap }]}>
          {/* TL — dark green */}
          <View style={[styles.cell, { width: size, height: size, borderRadius: r, backgroundColor: DARK }]} />
          {/* TR — dark green */}
          <View style={[styles.cell, { width: size, height: size, borderRadius: r, backgroundColor: DARK }]} />
        </View>

        <View style={{ height: gap }} />

        {/* Bottom row */}
        <View style={[styles.row, { gap }]}>
          {/* BL — lime + two arc strokes (simulated with white layered views) */}
          <View style={[styles.cell, { width: size, height: size, borderRadius: r, backgroundColor: LIME, overflow: 'hidden' }]}>
            {/* Arc 1 — upper terrain contour */}
            <View style={[
              styles.arc,
              {
                width: size * 1.4,
                height: size * 1.4,
                borderRadius: size * 0.7,
                borderWidth: Math.max(2, size * 0.09),
                bottom: -size * 0.55,
                right: -size * 0.55,
              },
            ]} />
            {/* Arc 2 — lower terrain contour */}
            <View style={[
              styles.arc,
              {
                width: size * 1.05,
                height: size * 1.05,
                borderRadius: size * 0.52,
                borderWidth: Math.max(2, size * 0.08),
                bottom: -size * 0.42,
                right: -size * 0.42,
              },
            ]} />
          </View>

          {/* BR — dark green + concave notch (white circle at inner corner) */}
          <View style={[styles.cell, { width: size, height: size, borderRadius: r, backgroundColor: DARK }]}>
            {/* White circle at top-left of cell punches out the concave corner */}
            <View style={[
              styles.concave,
              {
                width: concaveR * 2,
                height: concaveR * 2,
                borderRadius: concaveR,
                top: -concaveR,
                left: -concaveR,
              },
            ]} />
          </View>
        </View>
      </View>

      {/* ── LAND / RUSH wordmark ────────────────────────────── */}
      {showText && (
        <View style={[styles.wordmark, { marginLeft: gap * 2 }]}>
          <Text style={[styles.word, { fontSize, lineHeight: fontSize * 0.95 }, textColor && { color: textColor }]}>LAND</Text>
          <Text style={[styles.word, { fontSize, lineHeight: fontSize * 0.95 }, textColor && { color: textColor }]}>RUSH</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    overflow: 'hidden',
  },
  arc: {
    position: 'absolute',
    borderColor: 'rgba(255,255,255,0.55)',
    // Only show the top-left quadrant arc — clip via overflow:hidden on parent cell
    backgroundColor: 'transparent',
  },
  concave: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  wordmark: {
    flexDirection: 'column',
  },
  word: {
    fontWeight: '900',
    color: LIME,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
