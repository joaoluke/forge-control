import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface NewsItem {
	title: string;
	title_pt: string;
	link: string;
	description: string;
	description_pt: string;
	pub_date: string;
	source: string;
	category: string;
}

export function News() {
	const [news, setNews] = useState<NewsItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [translate, setTranslate] = useState(true);
	const [activeCategory, setActiveCategory] = useState('All');
	const [readingArticle, setReadingArticle] = useState<NewsItem | null>(null);
	const [articleContent, setArticleContent] = useState('');
	const [loadingContent, setLoadingContent] = useState(false);

	useEffect(() => {
		loadNews();
	}, []);

	async function loadNews() {
		try {
			setLoading(true);
			const items = await invoke<NewsItem[]>('fetch_news');
			setNews(items);
		} catch (error) {
			console.error('Failed to fetch news:', error);
		} finally {
			setLoading(false);
		}
	}

	async function openArticle(item: NewsItem) {
		setReadingArticle(item);
		setLoadingContent(true);
		setArticleContent('');

		try {
			// Pass the current translate state to the backend
			const content = await invoke<string>('fetch_article_content', { url: item.link, translate });
			setArticleContent(content);
		} catch (error) {
			console.error('Failed to fetch article content:', error);
			setArticleContent('<p>Failed to load article content. Please try visiting the source website.</p>');
		} finally {
			setLoadingContent(false);
		}
	}

	const categories = ['All', 'Technology', 'Programming', 'Hacking', 'AI', 'Academic'];

	const filteredNews = activeCategory === 'All'
		? news
		: news.filter(item => item.category === activeCategory);

	const getSourceColor = (source: string) => {
		switch (source) {
			case 'The Register': return 'text-red-400 border-red-400/30';
			case 'TechCrunch': return 'text-green-400 border-green-400/30';
			case 'Hacker News': return 'text-orange-400 border-orange-400/30';
			case 'Ars Technica': return 'text-cyan-400 border-cyan-400/30';
			case 'Wired': return 'text-slate-200 border-slate-200/30';
			case 'The Verge': return 'text-purple-400 border-purple-400/30';
			default: return 'text-blue-400 border-blue-400/30';
		}
	};

	const getSourceBg = (source: string) => {
		switch (source) {
			case 'The Register': return 'bg-red-400/10';
			case 'TechCrunch': return 'bg-green-400/10';
			case 'Hacker News': return 'bg-orange-400/10';
			case 'Ars Technica': return 'bg-cyan-400/10';
			case 'Wired': return 'bg-slate-200/10';
			case 'The Verge': return 'bg-purple-400/10';
			default: return 'bg-blue-400/10';
		}
	};

	return (
		<div className="p-8 h-full bg-[#0a0c10] relative">
			{readingArticle && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
					<div className="bg-[#0f1115] w-full max-w-4xl h-[90vh] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden relative">
						<div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#0f1115]">
							<div className="flex items-center gap-3">
								<span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${getSourceColor(readingArticle.source)} ${getSourceBg(readingArticle.source)}`}>
									{readingArticle.source}
								</span>
								<span className="text-slate-500 text-sm">
									{new Date(readingArticle.pub_date).toLocaleDateString(undefined, {
										weekday: 'long',
										year: 'numeric',
										month: 'long',
										day: 'numeric'
									})}
								</span>
							</div>
							<div className="flex gap-2">
								<a
									href={readingArticle.link}
									target="_blank"
									rel="noreferrer"
									className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
									title="Open in Browser"
								>
									<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
									</svg>
								</a>
								<button
									onClick={() => setReadingArticle(null)}
									className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
								>
									<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
						</div>

						<div className="flex-1 overflow-y-auto p-8 md:p-12 text-white">
							<h1 className="text-3xl md:text-4xl font-bold text-white mb-8 leading-tight">
								{translate ? readingArticle.title_pt : readingArticle.title}
							</h1>

							{loadingContent ? (
								<div className="flex flex-col items-center justify-center py-20 gap-4">
									<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
									<p className="text-slate-400 animate-pulse">Extracting article content...</p>
								</div>
							) : (
								<div
									className="article-content"
									dangerouslySetInnerHTML={{ __html: articleContent }}
								/>
							)}
						</div>
					</div>
				</div>
			)}

			<header className="mb-8 flex flex-col gap-6">
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
					<div>
						<h1 className="text-5xl font-extrabold tracking-tight text-white mb-3 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
							Tech Monitor
						</h1>
						<p className="text-slate-400 text-lg max-w-2xl">
							A real-time curation of the most relevant news from the global technology ecosystem.
						</p>
					</div>
					<div className="flex gap-4 items-center self-end md:self-auto">
						<div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md">
							<button
								onClick={() => setTranslate(false)}
								className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${!translate ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-slate-500 hover:text-slate-300'}`}
							>
								EN
							</button>
							<button
								onClick={() => setTranslate(true)}
								className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${translate ? 'bg-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'text-slate-500 hover:text-slate-300'}`}
							>
								PT
							</button>
						</div>
						<button
							onClick={loadNews}
							className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all active:scale-95 flex items-center gap-3 backdrop-blur-md group"
						>
							<svg className={`w-4 h-4 transition-transform ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
							<span className="font-medium text-sm">Atualizar</span>
						</button>
					</div>
				</div>

				{/* Category Pills */}
				<div className="flex flex-wrap gap-2">
					{categories.map((cat) => (
						<button
							key={cat}
							onClick={() => setActiveCategory(cat)}
							className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${activeCategory === cat
								? 'bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
								: 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
								}`}
						>
							{cat}
						</button>
					))}
				</div>
			</header>

			{loading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{[1, 2, 3, 4, 5, 6].map((i) => (
						<div key={i} className="h-[280px] bg-white/5 border border-white/10 rounded-2xl animate-pulse"></div>
					))}
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{filteredNews.map((item, index) => (
						<div
							key={index}
							onClick={() => openArticle(item)}
							className="group flex flex-col h-[320px] bg-white/[0.03] hover:bg-white/[state-0.07] border border-white/10 hover:border-white/20 rounded-2xl p-6 transition-all duration-300 relative overflow-hidden backdrop-blur-sm shadow-xl cursor-pointer"
						>
							{/* Decorative Glow */}
							<div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${getSourceBg(item.source)}`}></div>

							<div className="flex justify-between items-start mb-4">
								<span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-[0.1em] border ${getSourceColor(item.source)} ${getSourceBg(item.source)}`}>
									{item.source}
								</span>
								<span className="text-[11px] text-slate-500 font-medium">
									{new Date(item.pub_date).toLocaleDateString(undefined, {
										month: 'short',
										day: 'numeric'
									})}
								</span>
							</div>

							<h3 className="text-xl font-bold text-white mb-4 line-clamp-3 leading-tight group-hover:text-blue-400 transition-colors">
								{translate ? item.title_pt : item.title}
							</h3>

							<p className="text-sm text-slate-400 line-clamp-4 leading-relaxed flex-grow">
								{translate ? item.description_pt : item.description}
							</p>

							<div className="mt-6 flex items-center justify-between pt-4 border-t border-white/5">
								<div className="flex gap-2">
									<span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">
										{item.category}
									</span>
								</div>
								<span className="flex items-center gap-2 text-xs font-semibold text-slate-500 group-hover:text-blue-400 transition-colors">
									Read Full Story
									<svg className="w-4 h-4 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
									</svg>
								</span>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
