import type {Metadata} from 'next';
import ArticleLd from '../../../components/ArticleLd';
import './post.css';
const title='גדלנו על מפה שתמיד משקרת – וזה מה שאנחנו יודעים על העולם';
const description='מה שבאמת קורה כשעיצוב בוחר בשבילכם איך העולם נראה — ולמה המחיר של הבחירה הזו משתלם כבר בכיתה ד׳.';
const image='/media/blog/map-as-a-lie/cover-og.png';
export const metadata:Metadata={title,description,alternates:{canonical:'/blog/map-as-a-lie'},openGraph:{type:'article',locale:'he_IL',url:'/blog/map-as-a-lie',siteName:'עמית ברין',title,description,images:[{url:image,width:1200,height:630,alt:title}]},twitter:{card:'summary_large_image',creator:'@amit_brin',title,description,images:[image]}};
export default function Layout({children}:{children:React.ReactNode}){return <><ArticleLd slug="map-as-a-lie"/>{children}</>}
