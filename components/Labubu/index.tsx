import Image from 'next/image';
import styles from './Labubu.module.css';

interface LabubuProps {
  contractAddress: string;
  owner: string;
  style?: React.CSSProperties;
}

const Labubu: React.FC<LabubuProps> = ({ contractAddress, owner, style }) => {
  return (
    <div className={`${styles.labubuContainer} group`} style={style}>
      <Image src="/labubu.png" alt="Labubu" width={100} height={100} className={styles.labubuImage} />
      <div className="absolute bottom-full mb-2 w-max bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
        <p><strong>Owner:</strong> {owner}</p>
        <p><strong>Contract:</strong> {contractAddress}</p>
      </div>
    </div>
  );
};

export default Labubu;
