import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconServer, IconBolt, IconCreditCard, IconActivity } from '@douyinfe/semi-icons';
import { useScrollAnimation, useStaggerAnimation } from '../../hooks/useScrollAnimation';

const Features = () => {
  const { t } = useTranslation();
  const [titleRef, titleVisible] = useScrollAnimation({ threshold: 0.2 });
  const { setRef, isVisible } = useStaggerAnimation(4, { staggerDelay: 150 });

  const features = [
    {
      icon: <IconServer size="extra-large" className="text-white" />,
      title: '统一接口',
      desc: '一套 API 标准适配所有提供商。无需修改代码，即可在 OpenAI、Claude、Gemini 和 GPT-5 之间瞬间切换。',
      colSpan: 'md:col-span-2',
      bg: 'bg-gradient-to-br from-zinc-900 to-zinc-950'
    },
    {
      icon: <IconBolt size="extra-large" className="text-yellow-400" />,
      title: '高可用性',
      desc: '智能负载均衡和自动故障转移，确保您的服务永不掉线。',
      colSpan: 'md:col-span-1',
      bg: 'bg-zinc-900'
    },
    {
      icon: <IconCreditCard size="extra-large" className="text-green-400" />,
      title: '按量付费',
      desc: '按 Token 计费，价格透明。无订阅费，无隐形费用。',
      colSpan: 'md:col-span-1',
      bg: 'bg-zinc-900'
    },
    {
      icon: <IconActivity size="extra-large" className="text-blue-400" />,
      title: '实时分析',
      desc: '详细的使用日志和成本追踪，精确到每一分钱。',
      colSpan: 'md:col-span-2',
      bg: 'bg-gradient-to-bl from-zinc-900 to-zinc-950'
    }
  ];

  return (
    <div className="w-full py-24 bg-black text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div
          ref={titleRef}
          className={`mb-16 text-center scroll-animate ${titleVisible ? 'visible' : ''}`}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">为什么选择我们</h2>
          <p className="text-zinc-400 text-xl max-w-2xl mx-auto">
            专为追求性能、可靠性和灵活性的开发者打造。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              ref={setRef(index)}
              className={`${feature.colSpan} relative overflow-hidden rounded-3xl border border-zinc-800 p-8 group hover:border-zinc-600 transition-all duration-300 ${feature.bg} scroll-animate-scale ${isVisible(index) ? 'visible' : ''}`}
            >
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="mb-8 w-14 h-14 rounded-2xl bg-zinc-800/50 flex items-center justify-center border border-zinc-700/50 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-white">{feature.title}</h3>
                  <p className="text-zinc-400 leading-relaxed text-lg">{feature.desc}</p>
                </div>
              </div>
              
              {/* Hover Glow Effect */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/5 blur-3xl rounded-full group-hover:bg-white/10 transition-colors duration-500" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
