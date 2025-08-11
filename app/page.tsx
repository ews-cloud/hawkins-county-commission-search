import dynamic from 'next/dynamic'
const SearchApp = dynamic(() => import('@/components/SearchApp'), { ssr: false })
export default function Page() { return <SearchApp /> }