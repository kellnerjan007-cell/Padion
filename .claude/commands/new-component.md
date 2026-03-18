Create a Padion UI component following rules.md conventions.

First read `.ai/rules.md` for all styling and component rules.

The component name is: $ARGUMENTS

Create `components/[kebab-case-name].tsx` with:

**Structure:**
- Named export: `export function [ComponentName]({ ... }: [ComponentName]Props)`
- Typed props interface above the component
- NativeWind `className` for ALL styling (no StyleSheet.create)
- `Pressable` for tap targets (never TouchableOpacity)
- `expo-image` if the component shows images (never RN Image)
- `react-native-reanimated` if animations are needed (never Animated API)

**Patterns to follow:**
- Cards: `className="bg-surface rounded-2xl p-4 mb-3"`
- Primary text: `className="text-primary font-semibold"`
- Muted text: `className="text-muted text-sm"`
- Accent button: `className="bg-accent rounded-xl py-3 px-6 items-center"`
- Accent color: `#E94560` (use `text-accent` / `bg-accent`)
- Success: `text-success` / Warning: `text-warning`

**Accessibility:**
- Add `accessibilityLabel` on all Pressable elements
- Add `accessibilityRole` where appropriate

After creating the file, show the import line to use in screens.
