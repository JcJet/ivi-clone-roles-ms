import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RoleDto } from './dto/role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './roles.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}
  async createRole(dto: RoleDto) {
    console.log('2');
    const existingRole = await this.rolesRepository.findOneBy({
      value: dto.value,
    });

    if (existingRole) {
      throw new HttpException(
        'Роль с таким названием уже существует',
        HttpStatus.BAD_REQUEST,
      );
    }
    console.log('3');
    const rolesInsertResult = await this.rolesRepository.insert(dto);
    return rolesInsertResult.raw[0];
  }
  async getRoleById(id: number) {
    return await this.rolesRepository.findOneBy({ id });
  }
  async getAllRoles() {
    return await this.rolesRepository.find();
  }
  async updateRole(id: number, dto: RoleDto) {
    try {
      return await this.rolesRepository.update({ id }, dto);
    } catch (e) {
      throw new HttpException('Роль не найдена', HttpStatus.NOT_FOUND);
    }
  }
  async deleteRoleByValue(value: string) {
    try {
      return await this.rolesRepository.delete({ value });
    } catch (e) {
      throw new HttpException('Роль не найдена', HttpStatus.NOT_FOUND);
    }
  }
}
