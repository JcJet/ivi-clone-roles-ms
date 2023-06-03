import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { RoleDto } from './dto/role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './roles.entity';
import { Repository } from 'typeorm';
import { UserRoles } from './roles_users.entity';
import { AddUserRoleRecordDto } from './dto/addUserRoleRecord.dto';
import { AddUserRoleDto } from './dto/addUserRole.dto';

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(UserRoles)
    private userRolesRepository: Repository<UserRoles>,
  ) {}
  async onModuleInit() {
    const initialRoles: RoleDto[] = [
      { value: 'ADMIN', description: 'Admin user' },
      { value: 'USER', description: 'User' },
    ];
    for (const roleDto of initialRoles) {
      try {
        await this.createRole(roleDto);
      } catch (e) {
        if (e.status != HttpStatus.CONFLICT) {
          throw e;
        }
      }
    }
  }
  async createRole(dto: RoleDto) {
    const existingRole = await this.rolesRepository.findOneBy({
      value: dto.value,
    });

    if (existingRole) {
      throw new HttpException(
        'Роль с таким названием уже существует',
        HttpStatus.CONFLICT,
      );
    }
    const rolesInsertResult = await this.rolesRepository.insert(dto);
    return rolesInsertResult.raw[0];
  }
  async getRoleById(id: number) {
    return await this.rolesRepository.findOneBy({ id });
  }
  async getRoleByValue(value: string) {
    return await this.rolesRepository.findOneBy({ value });
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
    let roleId: number;
    try {
      const role = await this.rolesRepository.findOneBy({ value })
      roleId = role.id;
      await this.rolesRepository.delete({ value });

    } catch (e) {
      throw e;
      throw new HttpException('Роль не найдена', HttpStatus.NOT_FOUND);
    }
    if (roleId) {
      const deletedRoles = 1;
      const deletionResult = await this.userRolesRepository.delete({ roleId });
      const affectedUsers = deletionResult.affected;
      return { deletedRoles, affectedUsers };
    }
    return { deletedRoles: 0 };
  }

  async addUserRoles(dto: AddUserRoleDto) {
    let addedRoles = 0;
    for (const roleValue of dto.roles) {
      const existingRole = await this.rolesRepository.findOneBy({
        value: roleValue,
      });
      if (!existingRole) {
        await this.createRole({ value: roleValue, description: '' });
      }
      const role = await this.getRoleByValue(roleValue);
      const addRoleDto: AddUserRoleRecordDto = {
        roleId: role.id,
        userId: dto.userId,
      };
      const existingUserRole = await this.userRolesRepository.findOneBy(
        addRoleDto,
      );
      if (!existingUserRole) {
        await this.userRolesRepository.insert(addRoleDto);
        addedRoles += 1;
      }
    }
    return { addedRoles };
  }
  async getUserRoles(userId: number) {
    const userRoles: Role[] = [];
    const rolesUsers = await this.userRolesRepository.find({
      where: { userId },
    });
    for (const roleRecord of rolesUsers) {
      const role = await this.getRoleById(roleRecord.roleId);
      userRoles.push(role);
    }
    return userRoles;
  }
  async deleteUserRoles(dto: AddUserRoleDto) {
    let deletedRoles = 0;
    for (const roleValue of dto.roles) {
      const role = await this.getRoleByValue(roleValue);
      const deletionResult = await this.userRolesRepository.delete({
        roleId: role.id,
      });
      const affectedRows = deletionResult.affected || 0;
      deletedRoles += affectedRows;
    }
    return { deletedRoles };
  }
}
