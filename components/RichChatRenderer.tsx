import React from 'react';

interface ParsedBlock {
  type: 'paragraph' | 'steps' | 'cards' | 'list';
  text?: string;
  items?: any[];
}

export const parseMessage = (content: string): ParsedBlock[] => {
  const lines = content.split('\n');
  const blocks: ParsedBlock[] = [];
  let currentBlock: ParsedBlock | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      continue;
    }

    // Pattern 1: Numbered Steps (e.g. "1. **Enter Query**: Type...")
    const stepMatch = trimmed.match(/^(\d+)\.\s+\*\*(.*?)\*\*:\s*(.*)$/);
    if (stepMatch) {
      if (currentBlock && currentBlock.type !== 'steps') {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      if (!currentBlock) {
        currentBlock = { type: 'steps', items: [] };
      }
      currentBlock.items?.push({
        number: stepMatch[1],
        title: stepMatch[2],
        description: stepMatch[3]
      });
      continue;
    }

    // Pattern 2: Emoji / Special Bullet Cards (e.g. "🔬 **Market Data Agent**: Analyzes...")
    // We check that the line starts with a non-alphanumeric token, followed by a bold name and a colon.
    // To be safe, we check that it doesn't start with standard bullet symbols like -, *, •, or digits.
    const isStandardBullet = trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('•') || /^\d+/.test(trimmed);
    const cardMatch = !isStandardBullet && trimmed.match(/^(\S+)\s*\*\*(.*?)\*\*:\s*(.*)$/);
    
    if (cardMatch) {
      if (currentBlock && currentBlock.type !== 'cards') {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      if (!currentBlock) {
        currentBlock = { type: 'cards', items: [] };
      }
      currentBlock.items?.push({
        icon: cardMatch[1],
        title: cardMatch[2],
        description: cardMatch[3]
      });
      continue;
    }

    // Pattern 3: Standard Bullet list (e.g. "• Platform features and...")
    const bulletMatch = trimmed.match(/^([\-\*•])\s+(.*)$/);
    if (bulletMatch) {
      if (currentBlock && currentBlock.type !== 'list') {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      if (!currentBlock) {
        currentBlock = { type: 'list', items: [] };
      }
      currentBlock.items?.push({
        bullet: bulletMatch[1],
        text: bulletMatch[2]
      });
      continue;
    }

    // Pattern 4: Regular paragraph
    if (currentBlock && currentBlock.type !== 'paragraph') {
      blocks.push(currentBlock);
      currentBlock = null;
    }
    if (!currentBlock) {
      currentBlock = { type: 'paragraph', text: trimmed };
    } else {
      currentBlock.text += '\n' + trimmed;
    }
  }

  if (currentBlock) {
    blocks.push(currentBlock);
  }

  return blocks;
};

const renderInline = (text: string) => {
  if (!text) return null;
  
  // Basic escaping
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
    
  // Bold, Italic, and Code replacements
  const formatted = escaped
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-teal-600 dark:text-teal-400 text-xs border border-slate-200/30 dark:border-slate-700/30">$1</code>');
    
  return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
};

interface RichChatRendererProps {
  content: string;
}

const RichChatRenderer: React.FC<RichChatRendererProps> = ({ content }) => {
  const blocks = parseMessage(content);

  return (
    <div className="flex flex-col gap-3 text-slate-800 dark:text-slate-200">
      {blocks.map((block, bIdx) => {
        switch (block.type) {
          case 'paragraph':
            return (
              <p key={bIdx} className="text-sm leading-relaxed whitespace-pre-wrap">
                {renderInline(block.text || '')}
              </p>
            );
          
          case 'steps':
            return (
              <div key={bIdx} className="flex flex-col gap-3 my-2 pl-1 border-l-2 border-teal-100 dark:border-teal-900/60 ml-3">
                {block.items?.map((item, iIdx) => (
                  <div key={iIdx} className="relative pl-7 pb-1">
                    {/* Circle badge */}
                    <div className="absolute -left-[18px] top-0 flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs shadow-sm border-2 border-white dark:border-slate-900">
                      {item.number}
                    </div>
                    {/* Step card */}
                    <div className="bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200">
                      <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                        {renderInline(item.title)}
                      </h5>
                      <p className="text-slate-600 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                        {renderInline(item.description)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            );
          
          case 'cards':
            return (
              <div key={bIdx} className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2.5">
                {block.items?.map((item, iIdx) => (
                  <div 
                    key={iIdx} 
                    className="flex items-start gap-3.5 p-3 rounded-2xl bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-800/70 dark:to-slate-900/40 border border-slate-200/50 dark:border-slate-700/60 shadow-sm hover:shadow-md hover:border-teal-500/30 dark:hover:border-teal-500/30 transition-all duration-300 group"
                  >
                    {/* Icon container */}
                    <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 dark:from-teal-500/20 dark:to-cyan-500/20 border border-teal-500/25 dark:border-teal-500/40 text-2xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                      {item.icon}
                    </div>
                    {/* Text block */}
                    <div className="flex-1 min-w-0">
                      <h6 className="font-bold text-slate-800 dark:text-slate-200 text-xs group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {renderInline(item.title)}
                      </h6>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1 leading-relaxed">
                        {renderInline(item.description)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            );
          
          case 'list':
            return (
              <div key={bIdx} className="space-y-1.5 my-2 pl-1.5">
                {block.items?.map((item, iIdx) => (
                  <div key={iIdx} className="flex items-start gap-2.5">
                    {/* Custom bullet point indicator */}
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 shadow-sm shadow-teal-500/50"></span>
                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                      {renderInline(item.text)}
                    </p>
                  </div>
                ))}
              </div>
            );
          
          default:
            return null;
        }
      })}
    </div>
  );
};

export default RichChatRenderer;
