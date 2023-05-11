import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity(`roles`)
export class Role {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'USER', description: 'Название роли' })
  @Column({ type: 'varchar', unique: true })
  value: string;

  @ApiProperty({ example: 'Пользователь', description: 'Описание роли' })
  @Column({ type: 'varchar', nullable: true })
  description: string;
}
