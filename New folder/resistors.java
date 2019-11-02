import java.util.*;
public class Resistors
{
  
    public static void main(String[] args) {
      Scanner scan= new Scanner(System.in);
          System.out.println("please enter 3 integers ");
         System.out.println("please enter 1 integer"    );
         int r1 = scan.nextInt();
          System.out.println("please enter 2 integer" );
         int r2 = scan.nextInt(); 
         System.out.println("please enter 3 integer" );
        int r3 = scan.nextInt();
           double Rt; // Rt total ressistens
           float One=(r1*r2);
           float Two=(r1+r2);
           double FirstParll=One/Two;
          Rt= (FirstParll*r3)/(FirstParll+r3);
         System.out.println("the total resistance of resistors "+r1+", "+r2+" and "+r3+" connected in parallel is:"+Rt);
      
           
   
       
    }
}