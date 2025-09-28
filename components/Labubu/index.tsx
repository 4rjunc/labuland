import Image from 'next/image';
import styles from './Labubu.module.css';

interface LabubuProps {
  contractAddress: string;
  owner: string;
  style?: React.CSSProperties;
  imageUrl?: string;
}

const Labubu: React.FC<LabubuProps> = ({ contractAddress, owner, style, imageUrl = '/labubu.png' }) => {
  const isBaby = imageUrl === '/baby.png';
  const size = isBaby ? 60 : 100;

  return (
    <div className={`${styles.labubuContainer} group`} style={style}>
      <Image src={imageUrl} alt="Labubu" width={size} height={size} className={styles.labubuImage} />
      <div className="absolute bottom-full mb-2 w-max bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
        <p><strong>Owner:</strong> {owner}</p>
        <p><strong>Contract:</strong> {contractAddress}</p>
      </div>
    </div>
  );
};

export default Labubu;
