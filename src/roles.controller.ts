import { Controller } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RoleDto } from './dto/role.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @MessagePattern('createRole')
  async createRole(@Payload() data: { dto: RoleDto }) {
    return await this.rolesService.createRole(data.dto);
  }
  @MessagePattern('getRoleByValue')
  async getRoleByValue(@Payload() data: { id: number }) {
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
}
