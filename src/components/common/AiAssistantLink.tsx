import React from "react";
import { ExternalLink } from "lucide-react";
import { encodeForUrl } from "../../utils/urlUtils";

interface AiLinkProps {
  question: string;
  className?: string;
}

const AiAssistantLink: React.FC<AiLinkProps> = ({ question, className }) => {
  const baseUrl = "https://www.perplexity.ai/?q=";
  const encodedQuestion = encodeForUrl(question);
  const url = `${baseUrl}${encodedQuestion}`;

  return (
    // Il doit y avoir un return qui renvoie un élément JSX
    <a // L'élément doit être correctement formaté en JSX
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors ${
        className || ""
      }`}
    >
      <span>En savoir plus avec Perplexity</span>
      <ExternalLink size={16} />
    </a>
  );
};

export default AiAssistantLink;
