/**
 * Share Helper
 * Handles post sharing functionality
 */

/**
 * Generate a shareable URL for a post
 */
export const generatePostUrl = (postId: string): string => {
  return `${window.location.origin}/forum?post=${postId}`;
};

/**
 * Copy text to clipboard with fallback methods
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    // Modern Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback for older browsers or insecure contexts
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);

    return successful;
  } catch (error) {
    console.error("Copy error:", error);
    return false;
  }
};

/**
 * Handle post sharing with copy to clipboard
 */
export const sharePost = async (
  postId: string,
  title?: string,
  text?: string,
  onSuccess?: () => void,
  onError?: (url: string) => void
): Promise<void> => {
  const postUrl = generatePostUrl(postId);

  if (navigator.share) {
    try {
      await navigator.share({
        title: title || "Check out this post",
        text: text || "",
        url: postUrl,
      });
      return;
    } catch (error) {
      console.log("Error sharing:", error);
      // If user cancelled, don't fallback to clipboard
      if ((error as Error).name === 'AbortError') {
        return;
      }
    }
  }

  const success = await copyToClipboard(postUrl);

  if (success) {
    onSuccess?.();
  } else {
    // Fallback: show the URL to user
    onError?.(postUrl);
  }
};
