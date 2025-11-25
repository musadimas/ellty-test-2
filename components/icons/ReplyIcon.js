import * as React from "react";
const SvgReplyIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    className="reply-icon_svg__lucide reply-icon_svg__lucide-message-square-reply-icon reply-icon_svg__lucide-message-square-reply"
    {...props}
  >
    <path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z" />
    <path d="m10 8-3 3 3 3" />
    <path d="M17 14v-1a2 2 0 0 0-2-2H7" />
  </svg>
);
export default SvgReplyIcon;
