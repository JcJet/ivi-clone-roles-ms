import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity(`roles_users`)
export class UserRoles {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: '1', description: 'Идентификатор роли' })
  @Column({ type: 'numeric' })
  roleId: number;

  @ApiProperty({ example: '1', description: 'Идентификатор пользователя' })
  @Column({ type: 'numeric' })
  userId: number;
}
