import { Controller } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RoleDto } from './dto/role.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AddUserRoleRecordDto } from "./dto/addUserRoleRecord.dto";
import { UpdateUserRoleDto } from "./dto/updateUserRole.dto";

@Controller()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @MessagePattern('createRole')
  async createRole(@Payload() data: { dto: RoleDto }) {
    return await this.rolesService.createRole(data.dto);
  }
  @MessagePattern('getRoleById')
  async getRoleById(@Payload() data: { id: number }) {
    return await this.rolesService.getRoleById(data.id);
  }
  @MessagePattern('getAllRoles')
  async getAllRoles() {
    return await this.rolesService.getAllRoles();
  }
  @MessagePattern('updateRole')
  async updateRole(@Payload() data: { id: number; dto: RoleDto }) {
    return await this.rolesService.updateRole(data.id, data.dto);
  }
  @MessagePattern('deleteRoleByValue')
  async deleteRoleByValue(@Payload() data: { value: string }) {
    return await this.rolesService.deleteRoleByValue(data.value);
  }
  @MessagePattern('addUserRoles')
  async addUserRoles(@Payload() data: { dto: UpdateUserRoleDto }) {
    return await this.rolesService.addUserRoles(data.dto);
  }
  @MessagePattern('getUserRoles')
  async getUserRoles(@Payload() data: { userId: number }) {
    return await this.rolesService.getUserRoles(data.userId);
  }
  @MessagePattern('deleteUserRoles')
  async deleteUserRoles(@Payload() data: { dto: UpdateUserRoleDto }) {
    return await this.rolesService.deleteUserRoles(data.dto);
  }
}
