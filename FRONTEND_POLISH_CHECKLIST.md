# Frontend Polish & Testing Checklist

**Goal:** Ensure all screens work flawlessly, UX is smooth, and visual design is polished.

---

## Phase 1: Visual Polish

### Typography & Spacing
- [ ] All text sizes consistent with theme constants
- [ ] Line heights readable on all devices
- [ ] Padding/margins uniform throughout
- [ ] No text cutoff on smaller screens

### Colors & Theme
- [ ] Light mode tested (all screens)
- [ ] Dark mode tested (all screens)
- [ ] Color contrast meets accessibility standards
- [ ] Brand colors consistent across app

### Images & Media
- [ ] Images load without distortion
- [ ] Placeholder images display when missing
- [ ] Image aspect ratios correct on all screens
- [ ] Avatar fallback displays properly

---

## Phase 2: Interaction & Animation

### Buttons & Touch Targets
- [ ] All buttons have minimum 44pt touch area
- [ ] Button states clear (default, pressed, disabled)
- [ ] Loading states visible (spinners, text change)
- [ ] Disabled buttons appear disabled

### Navigation & Routing
- [ ] Back button works on all screens
- [ ] Deep linking works (direct URL to listing)
- [ ] No infinite loops or navigation bugs
- [ ] Header titles match screen content

### Forms
- [ ] Input fields keyboard responsive
- [ ] Dropdown menus open/close smoothly
- [ ] Form validation shows clear errors
- [ ] Multi-step forms remember data on back

### Animations
- [ ] Smooth transitions between screens
- [ ] Loading spinners visible and smooth
- [ ] No janky or stuttering animations
- [ ] Bottom sheet slides in/out smoothly

---

## Phase 3: Screen-by-Screen Testing

### Auth Screens
**Login Screen**
- [ ] Email/phone input accepts both formats
- [ ] Password input masked (shows dots)
- [ ] Forgot password button accessible
- [ ] Google & Apple login buttons visible
- [ ] Error messages clear and helpful

**Signup Screen**
- [ ] Email/phone validation works
- [ ] Password requirements displayed
- [ ] Password confirm matches validation
- [ ] Terms link navigates properly

**OTP Verification**
- [ ] 6 digit inputs focus/unfocus correctly
- [ ] Backspace deletes properly
- [ ] Resend countdown displays
- [ ] Timer resets on resend click

---

### Home & Browse (Seeker View)

**Home Feed**
- [ ] Listing cards display correctly
- [ ] Images load and scale properly
- [ ] Scroll is smooth (no lag)
- [ ] Category filter works
- [ ] Search filters results
- [ ] Bottom tab bar accessible

**Explore Location**
- [ ] 36 states grid displays
- [ ] States with listings bubble to top
- [ ] Search filters state list
- [ ] Tap navigates to state listings
- [ ] No console errors

**State Listings**
- [ ] Filtered listings display
- [ ] Empty state shows when no listings
- [ ] Scroll smooth
- [ ] Back button returns to explore

**Listing Detail**
- [ ] All listing fields visible
- [ ] Image gallery scrolls smoothly
- [ ] Agent card displays with rating
- [ ] Related listings carousel works
- [ ] Inspect button navigates to booking
- [ ] Save/unsave button toggles

**Map Screen**
- [ ] Map loads without errors
- [ ] Markers display for listings
- [ ] Tap marker shows preview
- [ ] Bottom sheet slides up/down
- [ ] Search filters on map
- [ ] No blank map issues

---

### Agent Dashboard

**Dashboard Home**
- [ ] Stats cards display correctly
- [ ] Numbers accurate (from mock data)
- [ ] Quick action buttons work
- [ ] Recent listings preview shows
- [ ] Empty state for new agents

**Listings Manager**
- [ ] All listings display with images
- [ ] Filter buttons work (all, active, taken, closed)
- [ ] Search filters by title/location
- [ ] Listing cards show price and views
- [ ] Edit button navigates to edit screen
- [ ] Delete button shows confirmation
- [ ] Share button opens modal
- [ ] Scroll smooth, no lag

**Edit Listing**
- [ ] Form loads with existing data
- [ ] Category buttons switch correctly
- [ ] State dropdown shows all 36 states
- [ ] Text inputs accept input
- [ ] Lease duration shows only for lease
- [ ] Save/Cancel buttons work
- [ ] Loading state shows while saving
- [ ] Success alert navigates back

**Agent Profile**
- [ ] Profile info displays correctly
- [ ] Avatar/initials show
- [ ] Bio readable
- [ ] Specializations display as tags
- [ ] Edit mode toggles smoothly
- [ ] Can add/remove specializations
- [ ] Certifications display with icons
- [ ] Stats show correct values

---

### Chat & Messaging

**Messages List**
- [ ] All conversations display
- [ ] Last message preview visible
- [ ] Unread count shows
- [ ] Scroll smooth
- [ ] Tap navigates to conversation

**Chat Screen**
- [ ] Messages display in chronological order
- [ ] Sent messages right-aligned
- [ ] Received messages left-aligned
- [ ] Timestamps visible
- [ ] Read/delivered status shows
- [ ] Typing indicator animates
- [ ] Input field functional
- [ ] Send button sends message
- [ ] Keyboard dismisses after send

---

### Bookings

**Bookings List**
- [ ] Upcoming bookings show
- [ ] Past bookings show
- [ ] Dates/times display correctly
- [ ] Agent info visible
- [ ] Cancel button accessible

**Create Booking**
- [ ] Date picker shows calendar
- [ ] Time picker functional
- [ ] Confirm button enables when complete
- [ ] Success navigates to bookings

---

### Notifications

**Notifications Screen**
- [ ] All notification types display
- [ ] Mark as read works
- [ ] Tap navigates to relevant screen
- [ ] Empty state for no notifications

---

### Profile & Settings

**User Profile**
- [ ] User info displays
- [ ] Avatar shows
- [ ] Dark mode toggle works instantly
- [ ] Menu items navigate correctly
- [ ] Logout shows confirmation
- [ ] Logout clears data

---

## Phase 4: Performance

### Load Time
- [ ] App launches in <3 seconds
- [ ] Screens render without delay
- [ ] Images lazy load properly
- [ ] Lists scroll smoothly (60fps)

### Memory
- [ ] No memory leaks on navigation
- [ ] Switching tabs doesn't reload data unnecessarily
- [ ] Images cached properly

### Network
- [ ] App works offline (shows cached data)
- [ ] Handles network errors gracefully
- [ ] Loading states clear when complete

---

## Phase 5: Accessibility

### Touch Targets
- [ ] All buttons 44pt minimum
- [ ] Spacing between buttons adequate

### Text
- [ ] Font sizes readable
- [ ] Color contrast sufficient
- [ ] No reliance on color alone

### Navigation
- [ ] All screens navigable via buttons
- [ ] No hidden actions
- [ ] Back button always available

---

## Phase 6: Device Testing

### iOS (if available)
- [ ] Test on iPhone 12 or later
- [ ] Safe area insets respected (notch)
- [ ] Status bar readable
- [ ] Bottom tab bar safe area

### Android (if available)
- [ ] Test on Android 12+
- [ ] Status bar respects system colors
- [ ] Navigation buttons work
- [ ] No layout issues with system UI

### Tablet (optional)
- [ ] Layouts scale to large screens
- [ ] Touch targets still adequate
- [ ] Text readable at distance

---

## Phase 7: Edge Cases & Error Handling

### Network Errors
- [ ] Show error message if API fails
- [ ] Retry button functional
- [ ] Graceful fallback to mock data

### Empty States
- [ ] No listings → clear CTA
- [ ] No messages → clear CTA
- [ ] No bookings → clear CTA

### Data Edge Cases
- [ ] Very long titles truncate properly
- [ ] Very long descriptions wrap
- [ ] Missing images show placeholder
- [ ] Missing avatar shows initials

### Input Validation
- [ ] Empty form shows error
- [ ] Invalid email rejected
- [ ] Invalid phone rejected
- [ ] Invalid price rejected

---

## Phase 8: Polish Improvements

### Visual Refinement
- [ ] Card shadows consistent
- [ ] Border radius consistent
- [ ] Icon alignment perfect
- [ ] Text alignment proper

### Animation Tweaks
- [ ] Loading spinner speed appropriate
- [ ] Transition timing smooth
- [ ] No jarring animation changes
- [ ] Animations don't block interaction

### Micro-interactions
- [ ] Button press feedback (scale)
- [ ] Success toast timing (2-3 sec)
- [ ] Error toast stays visible (4-5 sec)
- [ ] Empty state animations smooth

---

## Testing Workflow

### 1. Setup
```bash
# Start dev server
npx expo start

# Choose platform
# Press 'i' for iOS simulator
# Press 'a' for Android emulator
# Press 'w' for web browser
```

### 2. Systematic Testing
- [ ] Go through each section above
- [ ] Test on 2+ device sizes if possible
- [ ] Test light AND dark mode for each screen
- [ ] Test navigation both directions (forward & back)

### 3. Document Findings
For each issue found:
- [ ] Screenshot or video
- [ ] Screen name
- [ ] Steps to reproduce
- [ ] Expected vs actual behavior
- [ ] Severity (critical/high/medium/low)

### 4. Fix & Re-test
- [ ] Create git branch for fixes
- [ ] Fix issues in priority order
- [ ] Re-test fixed screens
- [ ] Commit with descriptive message

### 5. Final Sign-off
- [ ] All critical issues fixed
- [ ] All screens tested light & dark mode
- [ ] Navigation working end-to-end
- [ ] No console errors or warnings

---

## Common Issues to Watch For

### Layout
- Text cutoff on small screens → Add `numberOfLines` and ellipsis
- Overlapping UI → Check safe area insets, padding
- Button too close to edge → Add minimum padding

### Images
- Blurry images → Use correct aspect ratio
- Missing images → Show fallback placeholder
- Slow loading → Implement lazy load or caching

### Navigation
- Lost in navigation → Check router.push/back paths
- Go back fails → Ensure router.canGoBack() check
- Back button not visible → Add header back button

### Performance
- Smooth scroll issues → Check list virtualization
- Slow transitions → Profile animation performance
- Memory leak → Check useEffect cleanup

### Accessibility
- Text too small → Check minimum FontSize
- Colors hard to read → Check contrast ratio
- Touch targets too small → Ensure 44pt minimum

---

## Sign-off Criteria

App is ready to ship when:
- ✅ All critical issues fixed
- ✅ All screens tested (light & dark)
- ✅ Navigation works end-to-end
- ✅ No console errors/warnings
- ✅ Load times under 3 seconds
- ✅ Smooth scrolling (60fps)
- ✅ All form validation works
- ✅ Error handling graceful
- ✅ Accessibility baseline met
- ✅ Team sign-off received

---

## Tools for Testing

### Visual Testing
- Expo Go app (physical device)
- iOS Simulator
- Android Emulator
- Chrome DevTools (web)

### Performance
- React DevTools Profiler
- Expo DevTools
- Android Profiler

### Accessibility
- Accessibility Inspector (iOS)
- TalkBack (Android)

### Network
- Charles Proxy (inspect network)
- Disable network in DevTools (offline testing)

---

**Start testing now!** Pick a few screens and go through the checklist. Document any issues found, and we'll fix them together.

