// ❶ 데코레이터 임포트
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity() // ❷ 엔티티 객체임을 알려주기 위한 데코레이터
export class User {
  @PrimaryGeneratedColumn()
  id?: number; // ❸ id는 pk이며 자동 증가하는 값

  @Column({ unique: true })
  email: string; // ❹ email은 유니크한 값

  @Column()
  password: string;

  @Column()
  username: string;

  @Column({ default: true }) // ❺ 기본값을 넣어줌
  createdDt: Date = new Date();
}
