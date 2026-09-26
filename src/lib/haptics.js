// Haptic feedback for phones. Browser only.
//
// Android (Chrome, Firefox, Samsung Internet) has the Vibration API. iOS Safari
// has none, but since iOS 18 toggling a native switch control (<input switch>)
// plays the system haptic tick, so on iPhone we flip a hidden one instead.
// Both are silently ignored where unsupported, and both need the visitor to
// have tapped the page at least once.

let iosSwitch = null;

function iosTick() {
  if (!iosSwitch) {
    const label = document.createElement('label');
    label.setAttribute('aria-hidden', 'true');
    label.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.setAttribute('switch', '');
    input.tabIndex = -1;
    label.append(input);
    document.body.append(label);
    iosSwitch = label;
  }
  iosSwitch.click();
}

/**
 * Buzz the phone.
 * @param {number | number[]} pattern  milliseconds, or [on, off, on, ...]
 */
export function buzz(pattern) {
  if (typeof window === 'undefined') return;
  if (!window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  try {
    if (typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern);
    } else {
      iosTick();
    }
  } catch {
    // Haptics are a nicety; never let them break playing a note.
  }
}
