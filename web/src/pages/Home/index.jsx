/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React, { useContext, useEffect, useState } from 'react';
import {
  Button,
  Typography,
  Input,
  ScrollList,
  ScrollItem,
} from '@douyinfe/semi-ui';
import { API, showError, copy, showSuccess } from '../../helpers';
import { useIsMobile } from '../../hooks/common/useIsMobile';
import { useScrollAnimation, useStaggerAnimation } from '../../hooks/useScrollAnimation';
import { API_ENDPOINTS } from '../../constants/common.constant';
import { StatusContext } from '../../context/Status';
import { useActualTheme } from '../../context/Theme';
import { marked } from 'marked';
import { useTranslation } from 'react-i18next';
import {
  IconGithubLogo,
  IconPlay,
  IconFile,
  IconCopy,
} from '@douyinfe/semi-icons';
import { Link } from 'react-router-dom';
import NoticeModal from '../../components/layout/NoticeModal';
import {
  Moonshot,
  OpenAI,
  XAI,
  Zhipu,
  Volcengine,
  Cohere,
  Claude,
  Gemini,
  Suno,
  Minimax,
  Wenxin,
  Spark,
  Qingyan,
  DeepSeek,
  Qwen,
  Midjourney,
  Grok,
  AzureAI,
  Hunyuan,
  Xinference,
} from '@lobehub/icons';
import Features from './Features';
import Hero from './Hero';

const { Text } = Typography;

const Home = () => {
  const { t, i18n } = useTranslation();
  const [statusState] = useContext(StatusContext);
  const actualTheme = useActualTheme();
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');
  const [noticeVisible, setNoticeVisible] = useState(false);
  const isMobile = useIsMobile();
  const isDemoSiteMode = statusState?.status?.demo_site_enabled || false;
  const docsLink = statusState?.status?.docs_link || '';
  const serverAddress =
    statusState?.status?.server_address || `${window.location.origin}`;
  const endpointItems = API_ENDPOINTS.map((e) => ({ value: e }));
  const [endpointIndex, setEndpointIndex] = useState(0);
  const isChinese = i18n.language.startsWith('zh');

  // 滚动动画
  const [logoSectionRef, logoSectionVisible] = useScrollAnimation({ threshold: 0.2 });
  const { setRef: setLogoRef, isVisible: isLogoVisible } = useStaggerAnimation(6, { staggerDelay: 80 });
  const { setRef: setTagRef, isVisible: isTagVisible } = useStaggerAnimation(6, { staggerDelay: 60 });

  const displayHomePageContent = async () => {
    setHomePageContent(localStorage.getItem('home_page_content') || '');
    try {
      const res = await API.get('/api/home_page_content');
      const { success, message, data } = res.data;
      if (success) {
        let content = data;
        if (!data.startsWith('https://')) {
          content = marked.parse(data);
        }
        setHomePageContent(content);
        localStorage.setItem('home_page_content', content);

        // 如果内容是 URL，则发送主题模式
        if (data.startsWith('https://')) {
          const iframe = document.querySelector('iframe');
          if (iframe) {
            iframe.onload = () => {
              iframe.contentWindow.postMessage({ themeMode: actualTheme }, '*');
              iframe.contentWindow.postMessage({ lang: i18n.language }, '*');
            };
          }
        }
      } else {
          // showError(message);
          console.warn(message);
          setHomePageContent('加载首页内容失败...');
        }
      } catch (error) {
        console.warn('Failed to load home page content:', error);
      } finally {
        setHomePageContentLoaded(true);
      }
    };

  const handleCopyBaseURL = async () => {
    const ok = await copy(serverAddress);
    if (ok) {
      showSuccess(t('已复制到剪切板'));
    }
  };

  useEffect(() => {
    const checkNoticeAndShow = async () => {
      const lastCloseDate = localStorage.getItem('notice_close_date');
      const today = new Date().toDateString();
      if (lastCloseDate !== today) {
        try {
          const res = await API.get('/api/notice');
          const { success, data } = res.data;
          if (success && data && data.trim() !== '') {
            setNoticeVisible(true);
          }
        } catch (error) {
          console.warn('获取公告失败:', error);
        }
      }
    };

    checkNoticeAndShow();
  }, []);

  useEffect(() => {
    displayHomePageContent().then();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setEndpointIndex((prev) => (prev + 1) % endpointItems.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [endpointItems.length]);

  return (
    <div className='w-full overflow-x-hidden'>
      <NoticeModal
        visible={noticeVisible}
        onClose={() => setNoticeVisible(false)}
        isMobile={isMobile}
      />
      {homePageContentLoaded && homePageContent.startsWith('https://') ? (
        <div className='overflow-x-hidden w-full'>
            <iframe
              src={homePageContent}
              style={{ width: '100%', height: '100vh', border: 'none' }}
            />
        </div>
      ) : (
        <div className='w-full overflow-x-hidden bg-black min-h-screen'>
          {homePageContent && homePageContent !== '' && (
             <div className="w-full bg-zinc-900/50 text-zinc-200 p-4 text-center border-b border-zinc-800 backdrop-blur-sm">
                <div dangerouslySetInnerHTML={{ __html: homePageContent }} />
             </div>
          )}
          <Hero />
          <Features />
          
          {/* Provider Logos Section - Apple Style */}
          <div ref={logoSectionRef} className="w-full py-24 bg-zinc-950 border-t border-zinc-900">
            <div className="max-w-7xl mx-auto px-6 text-center">
              <h3 className={`text-2xl font-semibold text-zinc-400 mb-12 scroll-animate ${logoSectionVisible ? 'visible' : ''}`}>{t('Powering the next generation of apps')}</h3>

              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                {[OpenAI, Claude, Gemini, Midjourney, Grok, DeepSeek].map((Provider, index) => (
                  <div
                    key={index}
                    ref={setLogoRef(index)}
                    className={`w-12 h-12 md:w-16 md:h-16 flex items-center justify-center transition-all hover:scale-110 scroll-animate-scale ${isLogoVisible(index) ? 'visible' : ''}`}
                  >
                    <Provider.Avatar size={64} />
                  </div>
                ))}
              </div>

              <div className="mt-16 flex flex-wrap justify-center gap-4 text-zinc-500 text-sm font-medium">
                {['Llama 3', 'Mistral', 'Stable Diffusion', 'Qwen', 'Yi', '+ 40 More'].map((tag, index) => (
                  <span
                    key={index}
                    ref={setTagRef(index)}
                    className={`px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900/50 scroll-animate ${isTagVisible(index) ? 'visible' : ''}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
