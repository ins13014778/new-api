import React, { useState } from 'react';
import { Button, Typography, Toast } from '@douyinfe/semi-ui';
import { Link } from 'react-router-dom';
import { IconChevronRight, IconCopy } from '@douyinfe/semi-icons';
import { useTranslation } from 'react-i18next';

const CodeBlock = ({ code, language }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    Toast.success('复制成功');
  };

  return (
    <div className="relative group h-full">
      <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button 
          onClick={handleCopy} 
          className="text-zinc-400 hover:text-white p-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
        >
          <IconCopy />
        </button>
      </div>
      <pre className="font-mono text-sm leading-relaxed overflow-x-auto p-6 text-left h-full scrollbar-hide">
        <code className="block">
          {language === 'curl' && (
            <>
              <span className="text-purple-400">curl</span> <span className="text-green-400">https://api.newapi.pro/v1/chat/completions</span> \{'\n'}
              {'  '}<span className="text-blue-400">-H</span> <span className="text-orange-400">"Content-Type: application/json"</span> \{'\n'}
              {'  '}<span className="text-blue-400">-H</span> <span className="text-orange-400">"Authorization: Bearer sk-..."</span> \{'\n'}
              {'  '}<span className="text-blue-400">-d</span> <span className="text-yellow-300">'{'{'}</span>{'\n'}
              {'    '}<span className="text-blue-300">"model"</span>: <span className="text-orange-400">"gpt-4-turbo"</span>,{'\n'}
              {'    '}<span className="text-blue-300">"messages"</span>: <span className="text-yellow-300">[{'{'}</span>{'\n'}
              {'      '}<span className="text-blue-300">"role"</span>: <span className="text-orange-400">"user"</span>,{'\n'}
              {'      '}<span className="text-blue-300">"content"</span>: <span className="text-orange-400">"Hello!"</span>{'\n'}
              {'    '}<span className="text-yellow-300">{'}'}]</span>{'\n'}
              {'  '}<span className="text-yellow-300">{'}'}'</span>
            </>
          )}
          {language === 'python' && (
            <>
              <span className="text-purple-400">from</span> openai <span className="text-purple-400">import</span> OpenAI{'\n'}
              {'\n'}
              client = OpenAI({'\n'}
              {'  '}base_url=<span className="text-orange-400">"https://api.newapi.pro/v1"</span>,{'\n'}
              {'  '}api_key=<span className="text-orange-400">"sk-..."</span>{'\n'}
              ){'\n'}
              {'\n'}
              response = client.chat.completions.create({'\n'}
              {'  '}model=<span className="text-orange-400">"gpt-4-turbo"</span>,{'\n'}
              {'  '}messages=[<span className="text-yellow-300">{"{"}</span><span className="text-orange-400">"role"</span>: <span className="text-orange-400">"user"</span>, <span className="text-orange-400">"content"</span>: <span className="text-orange-400">"Hello!"</span><span className="text-yellow-300">{"}"}</span>]{'\n'}
              ){'\n'}
              {'\n'}
              <span className="text-yellow-300">print</span>(response.choices[0].message.content)
            </>
          )}
          {language === 'js' && (
            <>
              <span className="text-purple-400">import</span> OpenAI <span className="text-purple-400">from</span> <span className="text-orange-400">'openai'</span>;{'\n'}
              {'\n'}
              <span className="text-purple-400">const</span> client = <span className="text-purple-400">new</span> OpenAI({'{'}{'\n'}
              {'  '}baseURL: <span className="text-orange-400">'https://api.newapi.pro/v1'</span>,{'\n'}
              {'  '}apiKey: <span className="text-orange-400">'sk-...'</span>{'\n'}
              {'}'});{'\n'}
              {'\n'}
              <span className="text-purple-400">async function</span> <span className="text-blue-400">main</span>() {'{'}{'\n'}
              {'  '}<span className="text-purple-400">const</span> chatCompletion = <span className="text-purple-400">await</span> client.chat.completions.create({'{'}{'\n'}
              {'    '}messages: [<span className="text-yellow-300">{"{"}</span> role: <span className="text-orange-400">'user'</span>, content: <span className="text-orange-400">'Hello!'</span> <span className="text-yellow-300">{"}"}</span>],{'\n'}
              {'    '}model: <span className="text-orange-400">'gpt-4-turbo'</span>,{'\n'}
              {'  '}{'}'});{'\n'}
              {'\n'}
              {'  '}console.log(chatCompletion.choices[0].message.content);{'\n'}
              {'}'}{'\n'}
              {'\n'}
              main();
            </>
          )}
        </code>
      </pre>
    </div>
  );
};

const Hero = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('curl');

  return (
    <div className="relative w-full overflow-hidden bg-black text-white pt-24 pb-20 md:pt-32 md:pb-32">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[300px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        {/* Left Side: Text */}
        <div className="flex-1 text-center lg:text-left">
          <div className="mb-8 animate-fade-in-up flex justify-center lg:justify-start" style={{ animationDelay: '0.1s' }}>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700 backdrop-blur-md text-xs font-medium text-zinc-300">
              <span>新一代 API 网关</span>
              <IconChevronRight size="small" />
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            只需一行代码<br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              连接无限智能
            </span>
          </h1>

          <p className="text-lg text-zinc-400 mb-10 leading-relaxed animate-fade-in-up max-w-2xl mx-auto lg:mx-0" style={{ animationDelay: '0.3s' }}>
            兼容 OpenAI 协议，支持 GPT-4, Claude 3, Gemini Pro 等 100+ 主流大模型。
            <br className="hidden md:block" />
            企业级稳定性，极速响应，一键接入。
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up justify-center lg:justify-start" style={{ animationDelay: '0.4s' }}>
            <Link to="/console">
              <button className="px-8 py-3.5 rounded-full bg-white text-black font-semibold text-lg hover:bg-zinc-200 transition-all duration-300 transform hover:scale-105">
                立即开始
              </button>
            </Link>
            <a href="https://docs.newapi.pro" target="_blank" rel="noreferrer">
              <button className="px-8 py-3.5 rounded-full bg-zinc-900 border border-zinc-800 text-white font-medium text-lg hover:bg-zinc-800 transition-all duration-300">
                查看文档
              </button>
            </a>
          </div>
        </div>

        {/* Right Side: Code Window */}
        <div className="flex-1 w-full max-w-xl animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="rounded-xl overflow-hidden bg-[#1e1e1e] border border-zinc-800 shadow-2xl ring-1 ring-white/10 transform hover:scale-[1.02] transition-transform duration-500">
            {/* Mac Window Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#2d2d2d] border-b border-zinc-800">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
              </div>
              <div className="flex gap-4 text-xs font-medium text-zinc-400">
                <button
                  onClick={() => setActiveTab('curl')}
                  className={`${activeTab === 'curl' ? 'text-white' : 'hover:text-zinc-300'} transition-colors`}
                >
                  cURL
                </button>
                <button
                  onClick={() => setActiveTab('python')}
                  className={`${activeTab === 'python' ? 'text-white' : 'hover:text-zinc-300'} transition-colors`}
                >
                  Python
                </button>
                <button
                  onClick={() => setActiveTab('js')}
                  className={`${activeTab === 'js' ? 'text-white' : 'hover:text-zinc-300'} transition-colors`}
                >
                  Node.js
                </button>
              </div>
            </div>

            {/* Code Content */}
            <div className="h-[320px]">
                <CodeBlock language={activeTab} code={
                    activeTab === 'curl' ? `curl https://api.newapi.pro/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-..." \\
  -d '{
    "model": "gpt-4-turbo",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'` : activeTab === 'python' ? `from openai import OpenAI

client = OpenAI(
  base_url="https://api.newapi.pro/v1",
  api_key="sk-..."
)

response = client.chat.completions.create(
  model="gpt-4-turbo",
  messages=[{"role": "user", "content": "Hello!"}]
)

print(response.choices[0].message.content)` : `import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://api.newapi.pro/v1',
  apiKey: 'sk-...'
});

async function main() {
  const chatCompletion = await client.chat.completions.create({
    messages: [{ role: 'user', content: 'Hello!' }],
    model: 'gpt-4-turbo',
  });

  console.log(chatCompletion.choices[0].message.content);
}

main();`
                } />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
