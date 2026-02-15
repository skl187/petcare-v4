import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';

interface AppPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  status: 'Active' | 'Inactive';
}

const AppPageDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<AppPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock API fetch function - replace with your actual API call
  const fetchPage = async (slug: string) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock data - replace with your actual data source
      const mockPages: AppPage[] = [
        {
          id: 1,
          title: 'Privacy Policy',
          slug: 'privacy-policy',
          content:
            '<h1>Privacy Policy</h1><p>This is our detailed privacy policy...</p>',
          status: 'Active',
        },
        {
          id: 2,
          title: 'Terms and Conditions',
          slug: 'terms-conditions',
          content: '<h1>Terms</h1><p>These are our terms...</p>',
          status: 'Active',
        },
      ];

      const foundPage = mockPages.find((p) => p.slug === slug);
      if (!foundPage) throw new Error('Page not found');
      return foundPage;
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    const loadPage = async () => {
      try {
        if (!slug) throw new Error('No page specified');
        const data = await fetchPage(slug);
        setPage(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load page');
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [slug]);

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-4 max-w-4xl mx-auto'>
        <div className='bg-white rounded-lg shadow-md p-6 text-center'>
          <h2 className='text-heading-lg text-red-600 mb-4'>Error</h2>
          <p className='mb-4'>{error}</p>
          <button
            onClick={() => navigate(-1)}
            className='px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300'
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className='p-4 max-w-4xl mx-auto'>
        <div className='bg-white rounded-lg shadow-md p-6 text-center'>
          <h2 className='text-heading-lg mb-4'>Page Not Found</h2>
          <button
            onClick={() => navigate(-1)}
            className='px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300'
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='p-4 max-w-4xl mx-auto'>
      <button
        onClick={() => navigate(-1)}
        className='flex items-center mb-4 text-blue-600 hover:text-blue-800'
      >
        <MdArrowBack className='mr-1' /> Back to Pages
      </button>

      <div className='bg-white rounded-lg shadow-md p-6'>
        <h1 className='text-display-md mb-4'>{page.title}</h1>
        <div
          className='prose max-w-none'
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  );
};

export default AppPageDetail;
