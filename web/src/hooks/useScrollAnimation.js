import { useEffect, useRef, useState } from 'react';

/**
 * 滚动动画 Hook - 当元素进入视口时触发动画
 * @param {Object} options - Intersection Observer 选项
 * @param {number} options.threshold - 可见阈值 (0-1)
 * @param {string} options.rootMargin - 根边距
 * @param {boolean} options.triggerOnce - 是否只触发一次
 */
export const useScrollAnimation = (options = {}) => {
  const { threshold = 0.1, rootMargin = '0px 0px -50px 0px', triggerOnce = true } = options;
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce]);

  return [ref, isVisible];
};

/**
 * 多元素滚动动画 Hook - 为多个元素添加交错动画
 * @param {number} count - 元素数量
 * @param {Object} options - 选项
 */
export const useStaggerAnimation = (count, options = {}) => {
  const { staggerDelay = 100, ...observerOptions } = options;
  const refs = useRef([]);
  const [visibleItems, setVisibleItems] = useState(new Set());

  useEffect(() => {
    const observers = [];

    refs.current.forEach((element, index) => {
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setVisibleItems((prev) => new Set([...prev, index]));
            }, index * staggerDelay);
            observer.unobserve(element);
          }
        },
        { threshold: 0.1, rootMargin: '0px 0px -30px 0px', ...observerOptions }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [count, staggerDelay]);

  const setRef = (index) => (el) => {
    refs.current[index] = el;
  };

  const isVisible = (index) => visibleItems.has(index);

  return { setRef, isVisible };
};

export default useScrollAnimation;
