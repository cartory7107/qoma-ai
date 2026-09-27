import { useEffect, useRef, useState } from 'react';
import { marked } from 'marked';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

marked.setOptions({
  breaks: true,
  gfm: true,
});

export default function MarkdownRenderer({ content, isStreaming }: MarkdownRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse markdown
  const htmlContent = marked.parse(content || '') as string;

  // Enhance code blocks with copy buttons (Claude/GitHub style clean code block)
  useEffect(() => {
    if (!containerRef.current) return;

    const pres = containerRef.current.querySelectorAll('pre');
    pres.forEach((pre) => {
      if (pre.parentElement?.classList.contains('code-block-wrapper')) {
        return;
      }

      const codeElement = pre.querySelector('code');
      const rawCode = codeElement ? codeElement.innerText : pre.innerText;

      const langClass = Array.from(codeElement?.classList || []).find((c) =>
        c.startsWith('language-')
      );
      const language = langClass ? langClass.replace('language-', '') : 'code';

      const wrapper = document.createElement('div');
      wrapper.className =
        'code-block-wrapper my-3.5 rounded-xl border border-zinc-800 bg-[#18181b] shadow-sm overflow-hidden text-xs';

      const header = document.createElement('div');
      header.className =
        'flex items-center justify-between px-3.5 py-1.5 border-b border-zinc-800 bg-[#202023] text-zinc-400 font-mono text-[11px]';

      const langSpan = document.createElement('span');
      langSpan.className = 'font-semibold text-zinc-300 uppercase tracking-wider text-[10px]';
      langSpan.textContent = language;

      const copyBtn = document.createElement('button');
      copyBtn.className =
        'flex items-center gap-1 text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-zinc-800/80 hover:bg-zinc-700 transition-colors text-[11px] cursor-pointer';
      copyBtn.innerHTML = `<span>Copy</span>`;

      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(rawCode);
          copyBtn.innerHTML = `<span class="text-emerald-400 font-medium">Copied!</span>`;
          setTimeout(() => {
            copyBtn.innerHTML = `<span>Copy</span>`;
          }, 2000);
        } catch {
          // ignore
        }
      });

      header.appendChild(langSpan);
      header.appendChild(copyBtn);

      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(header);
      wrapper.appendChild(pre);

      pre.className = 'p-3.5 overflow-x-auto text-[13px] leading-relaxed text-zinc-100 bg-transparent m-0 font-mono';
    });
  }, [htmlContent]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="markdown-body text-zinc-900 text-[15px] font-normal leading-relaxed"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
      {isStreaming && (
        <span
          className="streaming-cursor"
          title="Cartory QOMA AI is generating..."
        />
      )}
    </div>
  );
}
