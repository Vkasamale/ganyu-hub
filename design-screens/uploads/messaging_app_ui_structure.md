# Messaging App Layout Architecture Blueprint

This document outlines the visual hierarchy, component breakdown, and responsive behavior for a modern messaging interface, modeled from top-tier mobile and desktop layouts.

---

## 1. Mobile Interface Architecture

### A. Sticky Top Header Stack
* **Top Utility Bar:** Action triggers positioned at the top screen edge:
  * **Left:** Overflow menu / Account switcher / Settings modal trigger (`...`).
  * **Right:** Quick Capture / Camera trigger (`📷`) and New Thread / Compose trigger (`+`).
* **View Context Title:** Large primary typography header establishing the active section (e.g., `Chats`).
* **Search Input Bar:** Full-width input field with embedded search icon, voice/AI prompt trigger, and contextual placeholder (e.g., *"Ask AI or Search"*).
* **Horizontal Quick-Filter Carousel:** Scrollable row of pill-shaped filter chips with active count badges:
  * `All` (Default)
  * `Unread [Count]`
  * `Favorites [Count]`
  * `Groups [Count]`
  * `+` (Custom tag creation / filter manager)

### B. Scrollable Primary Feed
* **System Anchors:** Sticky or top-anchored system folders:
  * `Archived` folder row with entry count indicator.
  * `@ Mentions` quick-access shortcut.
* **Thread Item Component (List Cell):**
  * **Left Segment:** Avatar thumbnail with status ring (online / active story / unread state).
  * **Center Segment:** 
    * Primary Title (Contact / Group Name) with status icon (e.g., verified / pinned / muted).
    * Subtitle Preview Snippet: Dynamic string displaying message text or rich-media indicator (e.g., `📷 2 photos`, `🎤 Voice call`, `~Sender: Message text`).
  * **Right Segment:** 
    * Timestamp string (e.g., `00:18`, `Tuesday`, `Yesterday`).
    * Inline status icons (Pin icon, Mute bell, Read receipts).
    * Highlighted unread pill badge containing numerical count.

### C. Persistent Bottom Navigation Dock
* **Fixed Bottom Bar:** Persistent bottom dock containing 4–5 main application routes:
  * `Updates` (Status / Stories / Channels)
  * `Calls` (Log / Start call)
  * `Communities` (Group hubs / Organizations)
  * `Chats` (Active messaging feed - highlighted)
  * `You` (Profile / Settings / Custom status)
* **Badge Overlays:** High-contrast numerical counters or dot indicators over icons showing pending updates.

---

## 2. Desktop & Web Interface Architecture

### A. Column 1: Vertical Collapsed Utility Rail (Primary Navigation)
* **Dimensions:** Fixed-width vertical strip (~50–60px).
* **Alignment:** Left-hand anchor extending top-to-bottom.
* **Contents:**
  * **Top Section:** Icon-only navigation triggers for major sections (`Chats`, `Calls`, `Status`, `Archived`, `Starred`).
  * **Middle Section:** Quick settings icon and app workspace toggles.
  * **Bottom Section:** Compact user profile avatar toggle.
* **States:** Active route highlighting with left indicator bar; badge dots overlaying specific icons for unread notifications.

### B. Column 2: Master List Panel (Thread Navigation)
* **Dimensions:** Flexible panel (~300–400px width).
* **Header:** Section Title (`Chats`) with fast actions: `New Chat` icon, `Filter / More Options` menu.
* **Search & Filter Stack:**
  * Embedded search bar identical to mobile configuration.
  * Horizontal scrollable filter chips (`All`, `Unread`, `Favorites`, `Groups`).
* **Thread List View:**
  * Chronologically ordered list of conversation cards.
  * Selected state indicator: Active conversation highlighted with a distinct background fill.
  * Rich inline previews (sender prefix, attachment type icons, unread badges, timestamps, pinned state).

### C. Column 3: Detail View & Workspace Pane
* **Contextual Header Bar:**
  * **Left:** Active thread avatar, title/group name, active members / status string.
  * **Right:** Action items: Audio Call, Video Call, In-Chat Search, Context Menu / Info Panel toggle.
* **Message Stream Container:**
  * Centered messaging feed with customizable ambient pattern or clean solid background.
  * Floating/Sticky chronological date dividers (e.g., `Yesterday`, `Saturday`).
  * **Bubble Layout:**
    * **Outgoing Messages:** Right-aligned, primary theme accent color, status checkmarks (Sent, Delivered, Read).
    * **Incoming Messages:** Left-aligned, contrasting background color, sender name tag (in groups).
    * **Rich Media Formatting:** Formatted cards for photos, videos, audio notes with waveform UI, document previews, and quote/reply preview blocks.
* **Integrated Composer Bar:**
  * Attached to the bottom of the workspace pane.
  * Action controls: Attachment picker (`+` / Paperclip), Emoji / GIF popover trigger (`😊`).
  * Auto-expanding multiline text input field.
  * Dynamic action button: Voice recording trigger (mic) toggling to a Send arrow when text is entered.

---

## 3. Layout Mapping & Viewport Breakdown

| Feature / Region | Mobile Layout (< 768px) | Desktop / Web Layout (≥ 768px) |
| :--- | :--- | :--- |
| **Primary Navigation** | Fixed Bottom Navigation Dock | Left Collapsed Vertical Rail |
| **Search & Filters** | Top Header Stack below Title | At top of Master List Panel |
| **Thread List** | Full Screen View | Column 2 Sidebar (Master View) |
| **Chat Detail View** | Replaces Thread List (Stack Nav) | Column 3 Workspace Pane (Split View) |
| **Quick Action Menu** | Top Right Header Icons | Master Panel Top Header Icons |

---

## 4. Design Guidelines for Custom Project Integration

1. **Information Architecture Flexibility:**
   * Keep the structural hierarchy (Rail -> List -> Detail) while replacing data models with your platform's domain (e.g., Projects, Support Tickets, Workspace Channels).
2. **Filter Chip Extensibility:**
   * Allow user-defined dynamic tag chips (e.g., `Urgent`, `Clients`, `Internal`, `Drafts`) in addition to default views.
3. **Responsive State Transitions:**
   * On desktop viewports wider than ~1200px, consider allowing Column 3's Info Panel (Contact Details / Shared Media) to open as a 4th column on the right without crowding the chat canvas.
