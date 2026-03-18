Audit the current file (or the file named in $ARGUMENTS) against Padion's coding rules.

First read `.ai/rules.md` completely.

Then analyze the target file and report:

## Rules Audit: [filename]

For each violation found, show:
- **Line number(s)**
- **Rule violated** (quote the rule from rules.md)
- **Current code** (the problematic snippet)
- **Fix** (the corrected version)

Check specifically for these common violations:
1. `StyleSheet.create()` used → must use NativeWind className
2. `ScrollView` with `.map()` → must use FlatList
3. `Image` from react-native → must use expo-image
4. `Animated` API → must use react-native-reanimated
5. `TouchableOpacity` → must use Pressable
6. Direct `supabase` call in screen or store → must go through service
7. `any` type → must use proper typing or `unknown`
8. `@react-navigation` import → must use Expo Router
9. Missing loading / error / empty states in a screen
10. Zustand store accessed without selector (full store subscription)
11. `enum` keyword → must use string union type
12. Missing typed props interface on a component
13. Class component → must be functional
14. `fetch()` for Supabase → must use Supabase SDK

If no violations: output "✓ No violations found. File follows all rules."

End with a count: "X violation(s) found."
